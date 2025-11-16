import {Button} from "../../../elements/common/Buttons.tsx";
import {useState} from "react";
import PageState from "love/model/PageState.ts";
import {apiAuth, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import {startRegistration} from "@simplewebauthn/browser";

function PasskeyRegistration(
  {reloader}: {
    reloader: (x: ((flag: number) => number)) => void
  }
) {
  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);

  async function getRegistrationOption() {
    setWorkState(PageState.WORKING);

    try {
      const optionResponse = await apiAuth.get(
        "/auth/passkey/register/option"
      );

      await registerPasskey(optionResponse.data.option);
    } catch (err) {
      handleAxiosError(err, setWorkState);
    }
  }

  //@ts-expect-error option 프론트에서 잘 줄 것임
  async function registerPasskey(option) {
    const attestation = await startRegistration({
      optionsJSON: option
    });

    try {
      await apiAuth.post(
        "/auth/passkey/register",
        {
          attestation: attestation
        }
      );

      reloader(x => x + 1);
      setWorkState(PageState.NORMAL);
    } catch (err) {
      handleAxiosError(err, setWorkState);
    }
  }

  return (
    <div>
      <Button
        onClick={getRegistrationOption}
        disabled={workState === PageState.WORKING}
      >패스키 등록</Button>
    </div>
  );
}

export default PasskeyRegistration;
