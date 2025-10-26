import {Link, Route, Routes, useParams} from "react-router-dom";
import {PencilIcon} from "../../assets/svgs/svgs.ts";
import type {FriendInformationType} from "../../core/apiResponseInterfaces/relationship.ts";
import {AnimatePresence, motion} from "framer-motion";
import {HorizontalListMotionVariants} from "../../core/motionVariants.ts";
import CoreTimeline from "./timeline/CoreTimeline.tsx";
import {useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import {uuidCheck} from "../../core/validation.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import type {GetGeneralPlanRequest} from "../../core/apiResponseInterfaces/plan.ts";
import {useDispatch} from "react-redux";
import {planActions} from "../../core/redux/PlanReducer.ts";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {PageError} from "../error/ErrorPage.tsx";

function CorePlan() {
  const planUuid = useParams()["planUUID"];
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  const planName = useAppSelector(state => state.planReducer.name);

  const dispatch = useDispatch();

  const currentPathList = window.location.pathname.split('.');
  const currentTab = currentPathList[currentPathList.length - 1];

  useEffect(() => {
    if (!planUuid || !uuidCheck(planUuid)) {
      setPageState(PageState.NOT_FOUND);
      return;
    }

    apiAuth.get<GetGeneralPlanRequest>(
      "/plan/" + planUuid
    ).then(res => {
      dispatch(planActions.init(res.data.plan));
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (pageState === PageState.LOADING) {
    return (<p>Loading</p>);
  } else if (isPageError(pageState)) {
    return <PageError pageState={pageState}/>
  }

  return (
    <div className={"p-5 flex flex-col gap-4"}>
      <div className={"flex items-center gap-3"}>
        <p className={"text-2xl font-bold"}>{planName}</p>
        <PencilIcon className={"fill-neutral-500"} width={20}/>
      </div>
      <div className={"flex gap-3 overflow-x-auto overflow-y-hidden"}>
        <AnimatePresence>
          <FriendDaegari friend={{
            name: "현창운",
            uid: "xxx"
          }}/>
          <FriendDaegari friend={{
            name: "이다민",
            uid: "xxx"
          }}/>
        </AnimatePresence>
      </div>

      <div className={"w-full flex"}>
        <Link className={"flex-grow text-center font-bold text-lg border-b-2 border-neutral-500 py-2"}
              to={`/plan/${planUuid}/timeline`}>일정</Link>
        <Link className={"flex-grow text-center font-bold text-lg border-b-2 border-neutral-300 py-2"}
              to={`/plan/${planUuid}/members`}>멤버</Link>
      </div>

      <div>
        <Routes>
          <Route path={""} element={<CoreTimeline/>}/>
          <Route path={"timeline"} element={<CoreTimeline/>}/>
        </Routes>
      </div>
    </div>
  );
}

function FriendDaegari(
  {friend}: {
    friend: FriendInformationType,
  }
) {
  return (
    <motion.div
      key={friend.uid}
      layout={"position"}
      variants={HorizontalListMotionVariants}
      initial={"initial"}
      animate={"animate"}
      exit={"exit"}
      className={"flex flex-col gap-2 items-center max-w-1/4"}
    >
      <img
        src={"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
        alt={friend.name}
        className={"rounded-full h-16 w-16"}
      />
      <p className={"font-medium cursor-default"}>{friend.name}</p>
    </motion.div>
  );
}

export default CorePlan;
