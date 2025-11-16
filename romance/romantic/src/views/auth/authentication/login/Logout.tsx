import {useAppDispatch} from "../../../../core/hook/ReduxHooks.ts";
import {useEffect, useState} from "react";
import {userInfoAction} from "../../../../core/redux/UserInfoReducer.ts";
import {useNavigate} from "react-router-dom";
import {api, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import PageState from "love/model/PageState.ts";
import {isPageError} from "../../../../../../love/api/APITypes.ts";
import {PageError} from "../../../error/ErrorPage.tsx";

function Logout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>(PageState.LOADING)

  useEffect(() => {
    dispatch(userInfoAction.signOut());

    api.post(
      "/auth/logout"
    ).then(() => {
      navigate("/login");
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (isPageError(pageState)) {
    return <PageError pageState={pageState}/>
  }

  return (
    <></>
  );
}

export default Logout;
