import GoogleRegister from "./GoogleRegister.tsx";
import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import InitialPreferenceSelector from "../InitialPreferenceSelector.tsx";
import {api} from "../../../../core/axios/withAxios.ts";
import type {userRegisterAPI} from "../../../../core/apiResponseInterfaces/register.ts";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {PageStepperMotion} from "../../../../core/motionVariants.ts";

function CoreGoogleRegister() {
  const [isForward, setIsForward] = useState<number>(1);
  const [step, setStep] = useState<number>(0);
  const [loadedSession, setLoadedSession] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [sex, setSex] = useState<number>(0);
  const [birthday, setBirthday] = useState<string>('');
  const [vEmail, setVEmail] = useState<string | null>(null);
  const [preferVector, setPreferVector] = useState<number[]>([]);

  const [pageState, setPageState] = useState<number>(0);
  const [blockForm, setBlockForm] = useState<boolean>(false);

  function next() {
    setIsForward(1);
    setStep(step + 1);
  }

  function prev() {
    setIsForward(-1);
    setStep(step - 1);
  }

  function done() {
    addUser();
  }

  function addUser() {
    setBlockForm(true);

    api.post<userRegisterAPI>(
      '/user/register',
      {
        name: name,
        email: email,
        sex: sex - 1,
        birthday: birthday,
        prefer: preferVector
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
      setBlockForm(true);
    });
  }

  const navigate = useNavigate();

  return (
    <>
      <div>
        <motion.div
          key={'progress'}
          className={'absolute top-0 left-0 w-screen rounded-r-full h-[4px] bg-neutral-700'}
          initial={{width: 0}}
          animate={{
            width: (step * 50.5) + '%',
          }}
        />
      </div>
      <div className={'flex flex-col gap-4 mt-[4px] p-5 h-[calc(100vh-68.74px)]'}>
        <AnimatePresence mode={'wait'} custom={isForward}>
          <motion.div
            key={step}
            custom={isForward}
            variants={PageStepperMotion}
            initial={"initial"}
            animate={"animate"}
            exit={"exit"}
            className={'h-full flex flex-col gap-4'}
          >
            {step === 0 &&
              <GoogleRegister
                next={next}
                loadedSession={loadedSession}
                setLoadedSession={setLoadedSession}
                name={name}
                email={email}
                vEmail={vEmail}
                sex={sex}
                birthday={birthday}
                setName={setName}
                setEmail={setEmail}
                setSex={setSex}
                setBirthday={setBirthday}
                setVEmail={setVEmail}
                blockForm={blockForm}
              />
            }
            {step === 1 &&
              <InitialPreferenceSelector
                prev={prev}
                next={done}
                preferVector={preferVector}
                setPreferVector={setPreferVector}
                blockForm={blockForm}
                pageState={pageState}
              />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default CoreGoogleRegister;
