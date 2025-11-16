import {PasskeyFilledIcon} from "../../../../assets/svgs/svgs.ts";
import {Button} from "../../../elements/common/Buttons.tsx";
import {api, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import {startAuthentication} from "@simplewebauthn/browser";
import {useNavigate} from "react-router-dom";
import type {PasskeyAuthenticationAPI} from "love/api/AuthenticationAPI.ts";
import {useState} from "react";
import PageState from "love/model/PageState.ts";

function PasskeyAuth() {
  const navigate = useNavigate();
  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);

  async function loginPasskey() {
    try {
      const option = await api.get(
        "/auth/passkey/challenge/option"
      );

      const attestation = await startAuthentication({
        optionsJSON: option.data.option
      });

      const challengeResponse = await api.post<PasskeyAuthenticationAPI>(
        "/auth/passkey/challenge",
        {
          attestation: attestation
        }
      );

      navigate("/login/set-token?at=" + challengeResponse.data.jwt);
    } catch (err) {
      handleAxiosError(err, setWorkState);
    }
  }

  return (
    <>
      <Button
        className={"w-full flex gap-[10px] px-[12px] py-[10px] justify-center items-center"}
        theme={"white"}
        onClick={loginPasskey}
      >
        <PasskeyFilledIcon width={20}/>
        <p className={"font-medium text-lg"}>Passkey로 로그인</p>
      </Button>
    </>
  );
}

export default PasskeyAuth;
