import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {ErrorPage} from "../../../error/ErrorPage.tsx";
import {useDispatch} from "react-redux";
import {userInfoAction} from '../../../../core/redux/UserInfoReducer.ts'
import {resetAccessToken} from "../../../../core/axios/apiAccessTokenInterceptor.ts";

function SetJwt() {
  const [searchParams] = useSearchParams();
  const [pageState, setPageState] = useState<number>(0);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => setJwt, []);

  function setJwt() {
    const accessToken: string | null = searchParams.get("at")

    if (accessToken == null) {
      setPageState(2);
      return;
    }

    resetAccessToken(accessToken)
      .then(credential => {
        dispatch(userInfoAction.signIn(credential))
        navigate('/')
      })
      .catch(e => {
        switch (e) {
          case 1:
            setPageState(1);
            break;
          case 2:
            setPageState(2);
            break;
          default:
            setPageState(3);
        }
      });
  }

  switch (pageState) {
    case 0:
      return (
        <div className={'flex justify-center items-center w-full h-full'}>
          <p>Signing in...</p>
        </div>
      )
    case 1:
      return (
        <ErrorPage
          errorCode={400}
          errorTitle={'Bad Request'}
          errorMessage={'잘못된 요청입니다.'}
        />
      )
    case 2:
      return (
        <ErrorPage
          errorCode={401}
          errorTitle={'Unauthorized'}
          errorMessage={'인증 정보가 잘못되었습니다.'}
        />
      )
    case 3:
      return (
        <ErrorPage
          errorCode={500}
          errorTitle={'Internal Server Error'}
          errorMessage={'인증하지 못했습니다.'}
        />
      )
  }
}

export default SetJwt;
