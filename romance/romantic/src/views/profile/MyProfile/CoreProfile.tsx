import {useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../../core/axios/withAxios.ts";
import type {UserAPI} from "love/api/UserAPI.ts";
import {ButtonLink} from "../../elements/common/Buttons.tsx";
import type {Identity} from "love/model/User.ts";
import {isPageError} from "love/api/APITypes.ts";
import PageState from "love/model/PageState.ts";
import {Outlet} from "react-router-dom";
import {SkeletonElement, SkeletonFrame} from "../../elements/loading/Skeleton.tsx";
import {PageError} from "../../error/ErrorPage.tsx";
import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import AnimatedSuspense from "../../elements/hierarchy/AnimatedSuspense.tsx";
import Img, {ImageType} from "../../elements/common/Imgs.tsx";


function CoreProfile() {
  const myUuid = useAppSelector(state => state.userInfoReducer.uid);

  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [identity, setIdentity] = useState<Identity>();

  useEffect(() => {
    Promise.all([
      apiAuth.get<UserAPI>("/user"),
    ]).then(([respUser]) => {
      setIdentity(respUser.data.user);
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (isPageError(pageState)) {
    return <PageError pageState={pageState}/>;
  }

  return (
    <AnimatedSuspense
      pageState={pageState}
      loadingSkeleton={<ProfileSkeleton/>}
      className={"flex flex-col gap-2.5 px-5 p-5"}
    >
      <div className={"flex justify-between mx-5 items-center"}>
        <div className={"flex items-center gap-4"}>
          <Img
            src={myUuid}
            className={"rounded-full h-16 w-16"}
            type={ImageType.PROFILE_PICTURE}
          />
          <p className={"text-xl font-bold"}>{identity?.name}</p>
        </div>
      </div>

      <div className={"flex gap-3"}>
        <ButtonLink className={"!rounded-lg !py-1 w-full"} theme={"white"} to={"/settings"}>프로필 수정</ButtonLink>
      </div>

      <div className={"mt-3"}>
        <Outlet/>
      </div>
    </AnimatedSuspense>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <SkeletonFrame className={"flex justify-between mx-5 items-center"}>
        <div className={"flex items-center gap-4"}>
          <SkeletonElement unit className={"rounded-full h-16 w-16"}/>
          <SkeletonElement unit expH={28} expW={65}/>
        </div>
      </SkeletonFrame>

      <div className={"flex gap-3"}>
        <ButtonLink className={"!rounded-lg !py-1 w-full"} theme={"white"} to={"/profile/edit"}>프로필 수정</ButtonLink>
      </div>

      <div className={"mt-3"}>
        <Outlet/>
      </div>
    </>
  );
}

export default CoreProfile;
