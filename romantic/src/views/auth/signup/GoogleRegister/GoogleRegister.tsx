import {useEffect, useState} from "react";
import {DatePicker, Select, TextInput} from "../../../elements/Inputs.tsx";
import {Form, FormGroup} from "../../../elements/Form.tsx";
import {Button} from "../../../elements/Buttons.tsx";
import {useNavigate} from "react-router-dom"
import {CheckmarkFillIcon, XMarkIcon} from "../../../../assets/svgs/svgs.ts";
import {check, lengthCheck, rangeCheck, regexCheck, verifyAll} from "../../../../core/validation.ts";
import type {authOAuthGoogleRegisterInfoAPI} from "../../../../core/apiResponseInterfaces/register.ts";
import {api} from "../../../../core/axios/withAxios.ts";

function GoogleRegister(
  {
    next,
    loadedSession,
    setLoadedSession,
    name,
    email,
    vEmail,
    sex,
    birthday,
    setName,
    setEmail,
    setSex,
    setBirthday,
    setVEmail,
    blockForm
  }: {
    next: () => void;
    loadedSession: boolean;
    setLoadedSession: (loadSession: boolean) => void;
    name: string, email: string, vEmail: string | null, sex: number, birthday: string;
    setName: (name: string) => void;
    setEmail: (email: string) => void;
    setSex: (sex: number) => void;
    setBirthday: (birthday: string) => void;
    setVEmail: (vEmail: string) => void;
    blockForm: boolean;
  }
) {
  const [formState, setFormState] = useState<number>(0);

  const navigate = useNavigate();

  function nextValidation() {
    const validation = verifyAll(
      lengthCheck(name, 1, 64),
      lengthCheck(email, 1, 64),
      rangeCheck(sex, 1, 3),
      regexCheck(email, /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/),
      regexCheck(birthday, /^(\d{4})-(0[1-9]|1[0-2])-([0-2][1-9]|3[0-1])$/)
    );

    setFormState(validation);
    if (validation === 0) next();
  }

  // preload google information
  useEffect(() => {
    if (loadedSession) return;

    api.get<authOAuthGoogleRegisterInfoAPI>(
      "/auth/oauth/google/register-info"
    ).then(res => {
      const data = res.data;

      if (data.content.auth.type != "google") {
        navigate("/login");
        return;
      }

      setName(data.content.name ?? "");
      setEmail(data.content.email ?? "");

      if (data.content.email_verified) setVEmail(data.content.email ?? null);
      setLoadedSession(true);
    }).catch(() => {
      navigate("/login");
    });
  }, []);

  let emailVerified = <XMarkIcon height={20} className={"mt-[-4px] fill-red-600"} title={"확인되지 않은 이메일입니다"}/>;
  if (vEmail == email) {
    emailVerified = <CheckmarkFillIcon height={20} className={"mt-[-4px] fill-green-600"} title={"확인된 이메일입니다"}/>;
  }

  return (
    <div className={"h-full flex flex-col gap-4"}>
      <p className={"text-2xl text-center font-bold"}>WITH 시작하기</p>

      <Form className={"flex-grow"}>
        <FormGroup name={"이름"}>
          <TextInput
            value={name}
            setter={setName}
            placeholder={"이름"}
            autocomplete={"name"}
            disabled={blockForm}
            error={check(formState, 0)}
          />
        </FormGroup>

        <FormGroup
          name={"이메일"}
          sidecar={emailVerified}
        >
          <TextInput
            value={email}
            setter={setEmail}
            placeholder={"이메일"}
            autocomplete={"email"}
            disabled={blockForm}
            error={check(formState, 1) || check(formState, 3)}
          />
        </FormGroup>

        <FormGroup name={"성별"}>
          <Select
            keys={[0, 1, 2, 3]}
            options={["성별", "남성", "여성", "기타"]}
            placeholder
            value={sex}
            setter={setSex}
            disabled={blockForm}
            error={check(formState, 2)}
          />
        </FormGroup>

        <FormGroup name={"생일"}>
          <DatePicker
            value={birthday}
            setter={setBirthday}
            disabled={blockForm}
            error={check(formState, 4)}
          />
        </FormGroup>
      </Form>

      <div className={"w-full flex justify-end"}>
        <Button onClick={nextValidation} disabled={blockForm}>다음</Button>
      </div>
    </div>
  );
}

export default GoogleRegister;
