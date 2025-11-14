import {BackHeader} from "../elements/hierarchy/HierarchyStructure.tsx";
import {Button} from "../elements/common/Buttons.tsx";
import {QRCodeSVG} from "qrcode.react";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import AnimatedSuspense from "../elements/hierarchy/AnimatedSuspense.tsx";
import {PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {SkeletonElement, SkeletonFrame} from "../elements/loading/Skeleton.tsx";

function ShareProfile() {
  const myName = useAppSelector(state => state.userInfoReducer.name);
  const myUuid = useAppSelector(state => state.userInfoReducer.uid);

  {/* 여기로 랜딩하면 profile이 set되지 않음 */
  }

  async function shareProfile() {
    const shareData = {
      title: "WITH - " + myName + "님의 프로필",
      text: myName + "님의 WITH 프로필을 공유합니다.",
      url: "https://with.ionya.ooo/user/" + myUuid
    };

    await navigator.share(shareData);
  }

  return (
    <AnimatedSuspense
      pageState={myUuid ? PageState.NORMAL : PageState.LOADING}
      loadingSkeleton={<ShareProfileSkeleton/>}
      className={"h-[calc(100vh-65px)]"}
    >
      <BackHeader title={"프로필 공유"}/>

      <div className={"h-[calc(100%-61px)] flex flex-col justify-center items-center gap-8"}>
        {/*TODO: QR코드 뭔가 간지나야하지 않겠냐*/}

        <p className={"text-4xl font-bold"}>{myName}</p>

        <QRCodeSVG
          value={"https://with.ionya.ooo/user/" + myUuid}
          className={"w-3/4 aspect-square"}
        />

        <Button theme={"white"} onClick={shareProfile}>프로필 공유</Button>
      </div>
    </AnimatedSuspense>
  );
}

function ShareProfileSkeleton() {
  return (
    <SkeletonFrame className={"flex flex-col justify-center items-center h-[calc(100vh-65px)] gap-5"}>
      <SkeletonElement unit className={"w-3/4 aspect-square"}/>
    </SkeletonFrame>
  );
}

export default ShareProfile;
