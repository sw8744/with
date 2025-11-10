import {Link, Route, Routes, useParams} from "react-router-dom";
import {PencilIcon} from "../../assets/svgs/svgs.ts";
import type {FriendInformationType} from "../../core/apiResponseInterfaces/relationship.ts";
import {AnimatePresence, motion} from "framer-motion";
import {HorizontalListMotionVariants} from "../../core/motionVariants.ts";
import CoreSchedule from "./schedule/CoreSchedule.tsx";
import {useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import {uuidCheck} from "../../core/validation.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import type {GetGeneralPlanRequest} from "../../core/apiResponseInterfaces/plan.ts";
import {useDispatch} from "react-redux";
import {planActions} from "../../core/redux/PlanReducer.ts";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {PageError} from "../error/ErrorPage.tsx";
import {SkeletonElement, SkeletonFrame} from "../elements/Skeleton.tsx";
import Spinner from "../elements/Spinner.tsx";
import CoreMembers from "./member/CoreMembers.tsx";
import ChangePlanName from "./ChangePlanName.tsx";

function CorePlan() {
  const planUuid = useParams()["planUUID"];
  const myUuid = useAppSelector(state => state.userInfoReducer.uid);
  const reduxPlanUuid = useAppSelector(state => state.planReducer.uid);
  const members = useAppSelector(state => state.planReducer.members);
  const refreshInterrupt = useAppSelector(state => state.planReducer.refreshInterrupt);

  const dispatch = useDispatch();

  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  const currentPathList = window.location.pathname.split('/');
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

  useEffect(() => {
    apiAuth.get<GetGeneralPlanRequest>(
      "/plan/" + planUuid
    ).then(res => {
      dispatch(planActions.init(res.data.plan));
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, [refreshInterrupt, dispatch, planUuid]);

  useEffect(() => {
    if (!myUuid || !reduxPlanUuid) return;
    dispatch(planActions.setRole(myUuid));
  }, [myUuid, dispatch, reduxPlanUuid])

  if (pageState === PageState.LOADING) {
    return (<CorePlanSkeleton/>);
  } else if (isPageError(pageState)) {
    return <PageError pageState={pageState}/>
  }

  let currentPage = 0;
  switch (currentTab) {
    case "timeline":
      currentPage = 0;
      break;
    case "members":
      currentPage = 1;
      break;
  }

  return (
    <div className={"p-5 flex flex-col gap-4"}>
      <ChangePlanName/>
      <div
        className={"flex gap-3 overflow-x-auto overflow-y-hidden"}> {/* fixme: 인싸들은 여기 공간 부족할지도, width 자동으로 넓혀줘야 함 */}
        <AnimatePresence>
          {members.map((member, idx) => (
            <FriendDaegari key={idx} friend={member}/>
          ))}
        </AnimatePresence>
      </div>

      <div className={"w-full flex"}>
        <Link
          className={
            "flex-grow text-center font-bold text-lg border-b-2 py-2 transition-all duration-200  " +
            (currentPage === 0 ? "border-neutral-500" : "border-neutral-300")
          }
          to={`/plan/${planUuid}/timeline`}
        >일정</Link>
        <Link
          className={
            "flex-grow text-center font-bold text-lg border-b-2 py-2 transition-all duration-200 " +
            (currentPage === 1 ? "border-neutral-500" : "border-neutral-300")
          }
          to={`/plan/${planUuid}/members`}
        >멤버</Link>
      </div>

      <div className={'flex flex-col gap-3'}>
        <Routes>
          <Route path={""} element={<CoreSchedule/>}/>
          <Route path={"timeline"} element={<CoreSchedule/>}/>
          <Route path={'members'} element={<CoreMembers/>}/>
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

function CorePlanSkeleton() {
  return (
    <SkeletonFrame>
      <div className={"p-5 flex flex-col gap-4"}>
        <div className={"flex items-center gap-3"}>
          <SkeletonElement unit expW={220} expH={32}/>
          <PencilIcon className={"fill-neutral-500"} width={20}/>
        </div>
        <div className={"flex gap-3 overflow-x-auto overflow-y-hidden"}>
          <div className={"flex flex-col gap-2 items-center max-w-1/4"}>
            <img
              src={"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
              className={"rounded-full h-16 w-16"}
            />
            <SkeletonElement unit expH={24} expW={45}/>
          </div>
        </div>

        <div className={"w-full flex"}>
          <p className={"flex-grow text-center font-bold text-lg border-b-2 border-neutral-500 py-2"}>일정</p>
          <p className={"flex-grow text-center font-bold text-lg border-b-2 border-neutral-300 py-2"}>멤버</p>
        </div>

        <Spinner className={'mx-auto'}/>
      </div>
    </SkeletonFrame>
  )
}

export default CorePlan;
