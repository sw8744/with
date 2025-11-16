import Panel from "../../elements/layout/panel.tsx";
import {Button, ButtonGroup} from "../../elements/form/Buttons.tsx";
import {useAppDispatch, useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import {H1} from "../../elements/typegraphy/Headers.tsx";
import {userInfoAction} from "../../../core/redux/UserInfoReducer.ts";
import issueNotification from "../../../core/notification/NotificationCenter.ts";
import {FormGroup} from "../../elements/form/General.tsx";
import {api} from "../../../core/axios/withAxios.ts";
import {startAuthentication} from "@simplewebauthn/browser";
import type {PasskeyAuthenticationAPI} from "love/api/AuthenticationAPI.ts";
import {refreshAccessToken, resetAccessToken} from "../../../core/axios/apiAccessTokenInterceptor.ts";
import {RequireRole, RoleTag} from "../../elements/RoleTag.tsx";
import {Role} from "love/model/User.ts";

function AuthLogin() {
  const userInfo = useAppSelector(state => state.userInfoReducer);
  const dispatch = useAppDispatch();

  async function login() {
    try {
      const challengeResponse = await api.get("/auth/passkey/challenge/option");

      const attestation = await startAuthentication({
        optionsJSON: challengeResponse.data.option
      });

      const loginResponse = await api.post<PasskeyAuthenticationAPI>(
        "/auth/passkey/challenge",
        {
          attestation: attestation
        }
      );

      const signin = await resetAccessToken(loginResponse.data.jwt);
      dispatch(userInfoAction.signIn(signin));
    } catch (err) {
      issueNotification("로그인 실패", "Passkey 로그인에 실패했습니다.\n" + err, "error");
    }
  }

  async function refresh() {
    try {
      await refreshAccessToken();
    } catch (err) {
      issueNotification("인증 실패", "Refresh Token 인증에 실패했습니다.\n" + err, "error");
    }
  }

  function reset() {
    dispatch(userInfoAction.signOut());
  }

  function logout() {
    api.post(
      "/auth/logout"
    ).then(() => {
      dispatch(userInfoAction.signOut());
    }).catch(err => {
      issueNotification("로그아웃 실패", "Refresh Token 삭제 요청에 실패했습니다.\n" + err, "error");
    });
  }


  return (
    <Panel>
      <RequireRole role={[Role.CORE_USER]}/>

      <H1>로그인</H1>
      <FormGroup>
        <ButtonGroup>
          <Button onClick={login}>Passkey 인증</Button>
          <Button onClick={refresh}>Refresh Token 인증</Button>
        </ButtonGroup>
      </FormGroup>

      <H1>로그인된 사용자</H1>
      <div className={"grid grid-cols-[auto_auto] gap-y-1 gap-x-4 w-fit my-2 items-center"}>
        <p>이름</p>
        <p>{userInfo.name ?? "N/A"}</p>

        <p>UUID</p>
        <p>{userInfo.uid ?? "N/A"}</p>

        <p>ROLE</p>
        <RoleTag role={userInfo.role}/>
      </div>
      <ButtonGroup>
        <Button onClick={reset}>로그인 해제</Button>
        <Button onClick={logout}>로그아웃</Button>
      </ButtonGroup>
    </Panel>
  );
}

export default AuthLogin;
