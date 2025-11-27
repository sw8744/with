import {type ReactNode, useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../../core/axios/withAxios.ts";
import type {SearchUsersAPI} from "love/api/UserAPI.ts";
import {MapPinAndEllipseIcon, PersonIcon, StarFilledIcon} from "../../../assets/svgs/svgs.ts";
import type {SearchedUser} from "love/model/User.ts";
import {isPageError} from "love/api/APITypes.ts";
import PageState from "love/model/PageState.ts";
import {Link, Outlet, useParams} from "react-router-dom";
import {SkeletonElement, SkeletonFrame} from "../../elements/loading/Skeleton.tsx";
import {PageError} from "../../error/ErrorPage.tsx";
import type {userFollowerCount, userFollowingCount} from "love/api/RelationshipAPI.ts";
import AnimatedSuspense from "../../elements/hierarchy/AnimatedSuspense.tsx";
import Img, {ImageType} from "../../elements/common/Imgs.tsx";
import {uuidCheck} from "love/validation.ts";
import EditRelationship from "./EditRelationship.tsx";

interface ProfileMenuButtonPropsType {
  children: ReactNode;
  to: string;
}

function ProfileMenuButton(
  {
    children,
    to
  }: ProfileMenuButtonPropsType
) {
  return (
    <Link
      to={to}
      className={"text-center w-[50px] border-b py-2 fill-neutral-700 border-neutral-700"}
    >
      {children}
    </Link>
  );
}

function CoreUser() {
  const userUuid = useParams()["userUUID"] as string;

  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [followers, setFollowers] = useState<number>();
  const [followings, setFollowings] = useState<number>();
  const [identity, setIdentity] = useState<SearchedUser>();

  useEffect(() => {
    if (!uuidCheck(userUuid)) {
      setPageState(PageState.NOT_FOUND);
      return;
    }

    Promise.all([
      apiAuth.get<SearchUsersAPI>(
        "/user/search",
        {
          params: {
            uid: userUuid,
            limit: 1
          }
        }
      ),
      apiAuth.get<userFollowingCount>("/user/following/count/" + userUuid),
      apiAuth.get<userFollowerCount>("/user/follower/count/" + userUuid)
    ]).then(([respUser, respFollowings, respFollowers]) => {
      setIdentity(respUser.data.users[0]);
      setFollowers(respFollowers.data.count);
      setFollowings(respFollowings.data.count);
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
            src={userUuid}
            className={"rounded-full h-16 w-16"}
            type={ImageType.PROFILE_PICTURE}
          />
          <p className={"text-xl font-bold"}>{identity?.name}</p>
        </div>
        <div className={"grid grid-cols-2 gap-x-6 grid-rows-2"}>
          <p className={"text-lg font-bold"}>{followers}</p>
          <p className={"text-lg font-bold"}>{followings}</p>
          <p>팔로워</p>
          <p>팔로잉</p>
        </div>
      </div>

      <EditRelationship friendUUID={userUuid} friendName={identity?.name ?? ""}/>

      <div className={"flex gap-3 justify-around px-5 mx-auto w-full max-w-[360px]"}>
        <ProfileMenuButton to={"/profile"}>
          <StarFilledIcon className={"mx-auto"} height={24}/>
        </ProfileMenuButton>
        <ProfileMenuButton to={"/profile/plans"}>
          <MapPinAndEllipseIcon className={"mx-auto"} height={24}/>
        </ProfileMenuButton>
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
        <div className={"grid grid-cols-2 gap-x-6 grid-rows-2"}>
          <SkeletonElement unit expH={24} expW={60}/>
          <SkeletonElement unit expH={24} expW={60}/>
          <p>팔로워</p>
          <p>팔로잉</p>
        </div>
      </SkeletonFrame>

      <SkeletonElement unit expH={34} className={"!rounded-lg !py-1 w-full"}/>

      <div className={"flex gap-3 justify-around px-5 mx-auto w-full max-w-[360px]"}>
        <ProfileMenuButton to={"/profile"}>
          <StarFilledIcon className={"mx-auto"} height={24}/>
        </ProfileMenuButton>
        <ProfileMenuButton to={"/profile/plans"}>
          <PersonIcon className={"mx-auto"} height={24}/>
        </ProfileMenuButton>
      </div>
      <div className={"mt-3"}>
        <Outlet/>
      </div>
    </>
  );
}

export default CoreUser;
