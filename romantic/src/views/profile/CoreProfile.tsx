import {type ReactNode, useEffect, useState} from "react";
import {apiAuth} from "../../core/axios/withAxios.ts";
import type {userAPI} from "../../core/apiResponseInterfaces/user.ts";
import {Button} from "../elements/Buttons.tsx";
import {GearIcon, MapPinIcon, MapPinAndEllipseIcon, StarFilledIcon, MapFilledIcon} from "../../assets/svgs/svgs.ts";
import {isAxiosError} from "axios";
import type {Identity} from "../../core/model/User.ts";
import type {interactionLikes} from "../../core/apiResponseInterfaces/interaction.ts";

interface ProfileMenuButtonPropsType {
  children: ReactNode;
  onClick: () => void;
}

function ProfileMenuButton(
  {
    children,
    onClick
  }
) {
  return (
    <button
      className={
        'text-center w-[50px] border-b py-2 fill-neutral-700 border-neutral-700 ' +
        ''
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function CoreProfile() {
  const [identity, setIdentity] = useState<Identity>();

  useEffect(() => {
    (async () => {
      const userResp = await apiAuth.get<userAPI>('/user');
      setIdentity(userResp.data.user);

      const likesResp = await apiAuth.get<interactionLikes>('/api/v1/interaction/like');
      const likedPlaceUids = likesResp.data.likes;

    })().catch(err => {
      if (isAxiosError(err)) {

      }
    });
  }, []);

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
        <ProfileMenuButton onClick={() => {}}>
          <MapPinAndEllipseIcon className={'mx-auto'}/>
        </ProfileMenuButton>
        <ProfileMenuButton onClick={() => {}}>
          <StarFilledIcon className={'mx-auto'}/>
        </ProfileMenuButton>
        <ProfileMenuButton onClick={() => {}}>
          <MapFilledIcon className={'mx-auto'}/>
        </ProfileMenuButton>
      </div>
    </div>
  );
}

export default CoreProfile;
