import {ButtonLink} from "../../../elements/Buttons.tsx";
import {LogoGoogleIcon} from "../../../../assets/svgs/svgs.ts";

function CoreLogin() {
  return (
    <div className={"flex flex-col w-full justify-center items-center gap-3"}>
      <p className={"mt-20 mb-5 text-5xl font-extrabold"}>WITH</p>

      <div
        className={
          "flex flex-col w-3/4 items-center gap-2"
        }
      >
        <ButtonLink
          to={import.meta.env.VITE_API_BASE_URL + "auth/oauth/google"}
          className={"w-full flex gap-[10px] px-[12px] py-[10px] justify-center items-center"}
          theme={"white"}
          reloadDocument
        >
          <LogoGoogleIcon width={20}/>
          <p>Google로 로그인</p>
        </ButtonLink>
      </div>
    </div>
  );
}

export default CoreLogin;
