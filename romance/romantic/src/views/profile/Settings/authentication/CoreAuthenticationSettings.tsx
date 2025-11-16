import {BackHeader} from "../../../elements/hierarchy/HierarchyStructure.tsx";
import AnimatedSuspense from "../../../elements/hierarchy/AnimatedSuspense.tsx";
import {type ReactElement, useEffect, useState} from "react";
import PageState from "love/model/PageState.ts";
import PasskeyRegistration from "./PasskeyRegistration.tsx";
import {apiAuth, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import type {AuthenticationMethodsAPI} from "love/api/AuthenticationAPI.ts";
import {LogoGoogleIcon, PasskeyFilledIcon} from "../../../../assets/svgs/svgs.ts";
import PasskeyList from "./PasskeyList.tsx";

function CoreAuthenticationSettings() {
  const [pageState, setPageState] = useState<PageState>(PageState.NORMAL);
  const [authMethods, setAuthMethods] = useState<AuthenticationMethodsAPI["methods"] | null>(null);

  const [reloadFlag, setReloadFlag] = useState<number>(0);

  useEffect(() => {
    apiAuth.get<AuthenticationMethodsAPI>("/auth/methods")
      .then(res => {
        setAuthMethods(res.data.methods);
        setPageState(PageState.NORMAL);
      }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, [reloadFlag]);

  const authMethodsList: ReactElement[] = [];
  if (authMethods) {
    if (authMethods.google) {
      authMethodsList.push(
        <LogoGoogleIcon height={32}/>
      );
    }

    if (authMethods.passkey > 0) {
      authMethodsList.push(
        <PasskeyFilledIcon height={32}/>
      );
    }
  }

  return (
    <AnimatedSuspense
      pageState={pageState}
      loadingSkeleton={<AuthenticationSettingsSkeleton/>}
    >
      <BackHeader title={"인증"}/>

      <div className={'mx-5'}>
        <div className={"my-3"}>
          <p className={"text-xl font-medium mb-2"}>인증 방법</p>
          <div className={"flex gap-3"}>
            {authMethodsList}
          </div>
        </div>

        <div className={"my-3"}>
          <p className={"text-xl font-medium mb-2"}>패스키</p>
          <PasskeyList reload={reloadFlag} reloader={setReloadFlag}/>
          <PasskeyRegistration reloader={setReloadFlag}/>
        </div>
      </div>
    </AnimatedSuspense>
  );
}

function AuthenticationSettingsSkeleton() {
  return (
    <>
    </>
  );
}

export default CoreAuthenticationSettings;
