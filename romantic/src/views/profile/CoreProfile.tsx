import {type ReactNode, useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {userAPI} from "../../core/apiResponseInterfaces/user.ts";
import {Button} from "../elements/Buttons.tsx";
import {MapFilledIcon, MapPinAndEllipseIcon, StarFilledIcon} from "../../assets/svgs/svgs.ts";
import type {Identity} from "../../core/model/User.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {Link, Outlet} from "react-router-dom";

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
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING)
  const [identity, setIdentity] = useState<Identity>();

  useEffect(() => {
    apiAuth.get<userAPI>(
      '/user'
    ).then(res => {
      setIdentity(res.data.user);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if(pageState === PageState.LOADING) {

  }
  if(isPageError(pageState)) {

  }

  return (
    <div className={'flex flex-col gap-2.5 m-5'}>
      <div className={'flex justify-between mx-5 items-center'}>
        <div>
          <p className={'text-xl font-bold'}>{identity?.name}</p>
        </div>
        <div>
          <p>233</p>
          <p>장소</p>
        </div>
        <div>
          <p>233</p>
          <p>팔로워</p>
        </div>
        <div>
          <p>233</p>
          <p>팔로잉</p>
        </div>
      </div>
      <div className={'flex gap-3'}>
        <Button className={'!rounded-lg !py-1 w-full'} theme={'white'}>프로필 수정</Button>
        <Button className={'!rounded-lg !py-1 w-full'} theme={'white'}>프로필 공유</Button>
      </div>
      <div className={'flex gap-3 justify-between px-5 mx-auto w-full max-w-[360px]'}>
        <ProfileMenuButton to={'/profile'}>
          <MapPinAndEllipseIcon className={'mx-auto'}/>
        </ProfileMenuButton>
        <ProfileMenuButton to={'/profile/liked'}>
          <StarFilledIcon className={'mx-auto'}/>
        </ProfileMenuButton>
        <ProfileMenuButton to={'/profile'}>
          <MapFilledIcon className={'mx-auto'}/>
        </ProfileMenuButton>
      </div>
      <div className={'mt-3'}>
        <Outlet/>
      </div>
    </div>
  );
}

export default CoreProfile;
