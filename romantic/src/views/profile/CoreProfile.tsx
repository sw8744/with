import {type ReactNode, useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {userAPI} from "../../core/apiResponseInterfaces/user.ts";
import {Button} from "../elements/Buttons.tsx";
import {MapFilledIcon, MapPinAndEllipseIcon, PersonIcon, StarFilledIcon} from "../../assets/svgs/svgs.ts";
import type {Identity} from "../../core/model/User.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {Link, Outlet} from "react-router-dom";
import {SkeletonElement} from "../elements/Skeleton.tsx";
import {PageError} from "../error/ErrorPage.tsx";
import type {userFollowerCount, userFollowingCount} from "../../core/apiResponseInterfaces/relationship.ts";

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
      className={
        'text-center w-[50px] border-b py-2 fill-neutral-700 border-neutral-700 ' +
        ''
      }
    >
      {children}
    </Link>
  );
}

function CoreProfile() {
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [followers, setFollowers] = useState<number>();
  const [followings, setFollowings] = useState<number>();
  const [identity, setIdentity] = useState<Identity>();

  useEffect(() => {
    Promise.all([
      apiAuth.get<userAPI>('/user'),
      apiAuth.get<userFollowingCount>('/user/following/count'),
      apiAuth.get<userFollowerCount>('/user/follower/count')
    ]).then(([respUser, respFollowings, respFollowers]) => {
      setIdentity(respUser.data.user);
      setFollowers(respFollowers.data.count);
      setFollowings(respFollowings.data.count);
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if(pageState === PageState.LOADING) {
    return <ProfileSkeleton/>
  }
  if(isPageError(pageState)) {
    return <PageError pageState={pageState}/>;
  }

  return (
    <div className={'flex flex-col gap-2.5 m-5'}>
      <div className={'flex justify-between mx-5 items-center'}>
        <div className={'w-1/4'}>
          <p className={'text-xl font-bold'}>{identity?.name}</p>
        </div>
        <div className={'w-[60%] grid grid-cols-3 grid-rows-2'}>
          <p className={'text-lg font-bold'}>233</p>
          <p className={'text-lg font-bold'}>{followers}</p>
          <p className={'text-lg font-bold'}>{followings}</p>
          <p>포스트</p>
          <p>팔로워</p>
          <p>팔로잉</p>
        </div>
      </div>
      <div className={'flex gap-3'}>
        <Button className={'!rounded-lg !py-1 w-full'} theme={'white'}>프로필 수정</Button>
        <Button className={'!rounded-lg !py-1 w-full'} theme={'white'}>프로필 공유</Button>
      </div>
      <div className={'flex gap-3 justify-between px-5 mx-auto w-full max-w-[360px]'}>
        <ProfileMenuButton to={'/profile'}>
          <MapFilledIcon className={'mx-auto'} height={24}/>
        </ProfileMenuButton>
        <ProfileMenuButton to={'/profile/liked'}>
          <StarFilledIcon className={'mx-auto'} height={24}/>
        </ProfileMenuButton>
        <ProfileMenuButton to={'/profile/trips'}>
          <MapPinAndEllipseIcon className={'mx-auto'} height={24}/>
        </ProfileMenuButton>
      </div>
      <div className={'mt-3'}>
        <Outlet/>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className={'flex flex-col gap-2.5 m-5'}>
      <div className={'flex justify-between mx-5 items-center'}>
        <div className={'w-1/4'}>
          <SkeletonElement expH={28} expW={65} pulse/>
        </div>
        <div className={'w-[60%] grid grid-cols-3 grid-rows-2'}>
          <SkeletonElement expH={24} expW={60} pulse/>
          <SkeletonElement expH={24} expW={60} pulse/>
          <SkeletonElement expH={24} expW={60} pulse/>
          <p>장소</p>
          <p>팔로워</p>
          <p>팔로잉</p>
        </div>
      </div>
      <div className={'flex gap-3'}>
        <Button className={'!rounded-lg !py-1 w-full'} theme={'white'}>프로필 수정</Button>
        <Button className={'!rounded-lg !py-1 w-full'} theme={'white'}>프로필 공유</Button>
      </div>
      <div className={'flex gap-3 justify-between px-5 mx-auto w-full max-w-[360px]'}>
        <ProfileMenuButton to={'/profile'}>
          <MapFilledIcon className={'mx-auto'} height={24}/>
        </ProfileMenuButton>
        <ProfileMenuButton to={'/profile/liked'}>
          <StarFilledIcon className={'mx-auto'} height={24}/>
        </ProfileMenuButton>
        <ProfileMenuButton to={'/profile/trips'}>
          <PersonIcon className={'mx-auto'} height={24}/>
        </ProfileMenuButton>
      </div>
      <div className={'mt-3'}>
        <Outlet/>
      </div>
    </div>
  );
}

export default CoreProfile;
