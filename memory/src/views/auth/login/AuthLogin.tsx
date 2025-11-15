import Panel from "../../elements/layout/panel.tsx";
import {Button, ButtonGroup} from "../../elements/form/Buttons.tsx";
import {useAppDispatch, useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import {H1} from "../../elements/typegraphy/Headers.tsx";
import {userInfoAction} from "../../../core/redux/UserInfoReducer.ts";
import {
  manualRefreshAccessToken,
  refreshAccessToken,
  resetAccessToken
} from "../../../core/axios/apiAccessTokenInterceptor.ts";
import issueNotification from "../../../core/notification/NotificationCenter.ts";
import {FormGroup, Label} from "../../elements/form/General.tsx";
import {TextInput} from "../../elements/form/Inputs.tsx";
import {useState} from "react";

function AuthLogin() {
  const userInfo = useAppSelector(state => state.userInfoReducer);
  const dispatch = useAppDispatch();

  const [accessToken, setAccessToken] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");

  async function login() {
    try {
      await refreshAccessToken();
    } catch (err) {
      issueNotification("로그인 실패", "액세스 토큰 갱신에 실패했습니다.\n" + err, "error");
    }
  }

  async function manualLogin() {
    try {
      await manualRefreshAccessToken(refreshToken);
    } catch (err) {
      issueNotification("로그인 실패", "액세스 토큰 갱신에 로그인에 실패했습니다.\n" + err, "error");
    }
  }

  function logout() {
    dispatch(userInfoAction.signOut());
  }

  async function loadAccessToken() {
    try {
      const credential = await resetAccessToken(accessToken);
      dispatch(userInfoAction.signIn(credential));
    } catch (err) {
      issueNotification("로그인 실패", "사용자 정보를 받아오지 못했습니다.\n" + err, "error");
    }
  }

  return (
    <Panel>
      <H1>Refresh Token 로그인</H1>
      <FormGroup>
        <Label>Refresh Token</Label>
        <TextInput
          value={refreshToken}
          setter={setRefreshToken}
          placeholder={"Refresh Token"}
        />
        <ButtonGroup>
          <Button onClick={login}>로그인</Button>
          <Button onClick={manualLogin}>쿠키 로그인</Button>
        </ButtonGroup>
      </FormGroup>

      <H1>Access Token 설정</H1>
      <FormGroup>
        <Label>Access Token</Label>
        <TextInput
          placeholder={"Access Token"}
          value={accessToken}
          setter={setAccessToken}
        />
        <Button onClick={loadAccessToken}>설정</Button>
      </FormGroup>

      <H1>로그인된 사용자</H1>
      <div className={"grid grid-cols-[auto_auto] gap-y-1 gap-x-4 w-fit my-2"}>
        <p>이름</p>
        <p>{userInfo.name ?? "N/A"}</p>

        <p>UUID</p>
        <p>{userInfo.uid ?? "N/A"}</p>

        <p>ROLE</p>
        <p>{userInfo.role}</p>
      </div>
      <Button onClick={logout}>로그아웃</Button>
    </Panel>
  );
}

export default AuthLogin;
