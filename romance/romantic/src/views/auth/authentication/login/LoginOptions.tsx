import {ButtonLink} from "../../../elements/common/Buttons.tsx";
import {LogoGoogleIcon, PasskeyFilledIcon} from "../../../../assets/svgs/svgs.ts";
import {motion} from "framer-motion";
import PasskeyAuth from "./PasskeyAuth.tsx";

function LoginOptions() {
  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -20}}
      transition={{duration: 0.3}}
      className={"flex flex-col w-3/4 items-center gap-2"}
    >
      <ButtonLink
        to={import.meta.env.VITE_API_BASE_URL + "auth/oauth/google"}
        className={"w-full flex gap-[10px] px-[12px] py-[10px] justify-center items-center"}
        theme={"white"}
        reloadDocument
      >
        <LogoGoogleIcon width={20}/>
        <p className={"font-medium text-lg"}>Google로 로그인</p>
      </ButtonLink>

      <PasskeyAuth/>
    </motion.div>
  );
}

export default LoginOptions;
