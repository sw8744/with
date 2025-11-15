import GoogleRegister from "./GoogleRegister.tsx";
import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import InitialPreferenceSelector from "../InitialPreferenceSelector.tsx";
import {api, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import type {userRegisterAPI} from "love/api/RegisterAPI.ts";
import {useNavigate} from "react-router-dom";
import {PageStepperMotion} from "../../../../core/motionVariants.ts";
import PageState from "love/model/PageState.ts";

function CoreGoogleRegister() {
  const [isForward, setIsForward] = useState<number>(1);
  const [step, setStep] = useState<number>(0);
  const [loadedSession, setLoadedSession] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [sex, setSex] = useState<number>(0);
  const [birthday, setBirthday] = useState<string>("");
  const [vEmail, setVEmail] = useState<string | null>(null);
  const [preferVector, setPreferVector] = useState<number[]>(
    Array.from({length: 100}, () => 0)
  );

  const [pageState, setPageState] = useState<PageState>(PageState.NORMAL);
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
    setPageState(PageState.WORKING);

    api.post<userRegisterAPI>(
      "/user/register",
      {
        name: name,
        email: email,
        sex: sex - 1,
        birthday: birthday,
        prefer: preferVector
      }
    ).then(res => {
      navigate("/login/set-token?at=" + res.data.jwt);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    }).finally(() => {
      setBlockForm(false);
    });
  }

  const navigate = useNavigate();

  return (
    <>
      <div className={"w-full absolute left-0 top-0 overflow-clip"}>
        <motion.div
          className={"w-full rounded-r-full h-[4px] bg-neutral-700"}
          initial={{width: 0}}
          animate={{
            width: (step * 50.5) + "%",
          }}
        />
      </div>
      <div className={"flex flex-col gap-4 mt-[4px] p-5 min-h-[calc(100vh-65px)]"}>
        <AnimatePresence mode={"wait"} custom={isForward}>
          <motion.div
            key={step}
            custom={isForward}
            variants={PageStepperMotion}
            initial={"initial"}
            animate={"animate"}
            exit={"exit"}
            className={"h-full flex flex-col gap-4"}
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
                signInState={pageState}
              />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default CoreGoogleRegister;
