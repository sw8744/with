import {useEffect, useState} from "react";
import {DatePicker, Select, TextInput} from "../../elements/Inputs.tsx";
import {Form, FormGroup} from "../../elements/Form.tsx";
import {Button} from "../../elements/Buttons.tsx";
import {useNavigate} from 'react-router-dom'
import axios from "axios";
import {CheckmarkFillIcon, XMarkIcon} from "../../../assets/svgs/svgs.ts";
import {check, lengthCheck, rangeCheck, regexCheck, verifyAll} from "../../../core/validation.ts";
import type {authOAuthGoogleRegisterInfoAPI, userRegisterAPI} from "../../../core/apiResponseInterfaces/register.ts";
import Alert from "../../elements/Alert.tsx";
import {api} from "../../../core/axios/withAxios.ts";

function GoogleRegister() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [sex, setSex] = useState<number>(0);
  const [birthday, setBirthday] = useState<string>('');
  const [vEmail, setVEmail] = useState<string | null>(null);
  const [formState, setFormState] = useState<number>(0);
  const [blockForm, setBlockForm] = useState<boolean>(false);
  const [pageState, setPageState] = useState<number>(0);

  const navigate = useNavigate();

  function register() {
    const validation = verifyAll(
      lengthCheck(name, 1, 64),
      lengthCheck(email, 1, 64),
      rangeCheck(sex, 1, 3),
      regexCheck(email, /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/),
      regexCheck(birthday, /^(\d{4})-(0[1-9]|1[0-2])-([0-2][1-9]|3[0-1])$/)
    );

    setFormState(validation);
    if (validation === 0) addUser();
  }

  function addUser() {
    setBlockForm(true);

    api.post<userRegisterAPI>(
      '/user/register',
      {
        name: name,
        email: email,
        sex: sex - 1,
        birthday: birthday
      }
    ).then(res => {
      navigate('/login/set-token?at=' + res.data.jwt);
    }).catch(err => {
      if (axios.isAxiosError(err)) {
        const status = err.status;

        switch (status) {
          case 404:
            setPageState(2);
            break;
          case 400:
            setPageState(3);
            break;
          default:
            setPageState(4);
            break;
        }
      } else setPageState(4);
    }).finally(() => {
      setBlockForm(false);
    });
  }

  // preload google information
  useEffect(() => {
    api.get<authOAuthGoogleRegisterInfoAPI>(
      '/auth/oauth/google/register-info'
    ).then(res => {
      const data = res.data;

      if (data.content.auth.type != 'google') {
        navigate('/login');
        return;
      }

      setName(data.content.name ?? '');
      setEmail(data.content.email ?? '');

      if (data.content.email_verified) setVEmail(data.content.email ?? null);
    }).catch(() => {
      navigate('/login');
    });
  }, []);

  let emailVerified = <XMarkIcon height={20} className={'mt-[-4px] fill-red-600'} title={'확인되지 않은 이메일입니다'}/>;
  if (vEmail == email) {
    emailVerified = <CheckmarkFillIcon height={20} className={'mt-[-4px] fill-green-600'} title={'확인된 이메일입니다'}/>;
  }

  return (
    <div className={'flex flex-col items-center mt-5 gap-5'}>
      <p className={'text-3xl font-bold'}>WITH 시작하기</p>

      <Form>
        <FormGroup name={'이름'}>
          <TextInput
            value={name}
            setter={setName}
            placeholder={'이름'}
            autocomplete={'name'}
            disabled={blockForm}
            error={check(formState, 0)}
          />
        </FormGroup>

        <FormGroup
          name={'이메일'}
          sidecar={emailVerified}
        >
          <TextInput
            value={email}
            setter={setEmail}
            placeholder={'이메일'}
            autocomplete={'email'}
            disabled={blockForm}
            error={check(formState, 1) || check(formState, 3)}
          />
        </FormGroup>

        <FormGroup name={'성별'}>
          <Select
            keys={[0, 1, 2, 3]}
            options={['성별', '남성', '여성', '기타']}
            placeholder
            value={sex}
            setter={setSex}
            disabled={blockForm}
            error={check(formState, 2)}
          />
        </FormGroup>

        <FormGroup name={'생일'}>
          <DatePicker
            value={birthday}
            setter={setBirthday}
            disabled={blockForm}
            error={check(formState, 4)}
          />
        </FormGroup>
      </Form>
      <Button onClick={register}>회원가입</Button>

      <Alert variant={'errorFill'} show={pageState === 2}>세션이 만료되었습니다. 다시 로그인해주세요.</Alert>
      <Alert variant={'errorFill'} show={pageState === 3}>잘못된 요청입니다.</Alert>
      <Alert variant={'errorFill'} show={pageState === 4}>회원가입하지 못했습니다.</Alert>
    </div>
  );
}

export default GoogleRegister;
