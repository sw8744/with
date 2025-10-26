import {useParams} from "react-router-dom";
import {PencilIcon} from "../../assets/svgs/svgs.ts";
import type {FriendInformationType} from "../../core/apiResponseInterfaces/relationship.ts";
import {AnimatePresence, motion} from "framer-motion";
import {HorizontalListMotionVariants} from "../../core/motionVariants.ts";
import type {ReactNode} from "react";
import DatePoll from "./DatePoll.tsx";
import HostFixDate from "./HostFixDate.tsx";

function CorePlan() {
  const planUuid = useParams()['planUUID'];

  return (
    <div className={'p-5 flex flex-col gap-4'}>
      <div className={'flex items-center gap-3'}>
        <p className={'text-2xl font-bold'}>10월 23일 경주월드</p>
        <PencilIcon className={'fill-neutral-500'} width={20}/>
      </div>
      <div className={'flex gap-3 overflow-x-auto overflow-y-hidden'}>
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

      <DatePoll/>
      <HostFixDate/>

      <div className={'flex flex-col'}>
        <div className={'flex gap-2 item-center my-1'}>
          <p className={'text-xl font-medium'}>2025.10.25 월요일</p>
          <p>Possible Precipipation</p>
        </div>

        <PlanPlaceSegment/>
        <PlanMovementTimeSegment/>
        <PlanPlaceSegment/>

        <div className={'flex gap-2 item-center my-1'}>
          <p className={'text-xl font-medium'}>2025.10.26 화요일</p>
          <p>Possible Precipipation</p>
        </div>
        <PlanMovementTimeSegment/>
        <PlanPlaceSegment/>
        <PlanPlaceSegment/>
        <PlanMovementTimeSegment/>
        <PlanPlaceSegment/>

        <PlanProgressionTail/>
      </div>
    </div>
  );
}

function PlanPlaceSegment() {
  return (
    <PlanProgressionSegment
      time={'18:00'}
    >
      <p className={'text-lg font-medium mb-1'}>4233 마음센터</p>
      <div className={'px-2'}>
        <p className={'my-0.5'}>서울특별시 연남동</p>
        <p className={'my-0.5'}>예약 필수</p>
      </div>
    </PlanProgressionSegment>
  )
}

function PlanMovementTimeSegment() {
  return (
    <PlanProgressionSegment
      time={'19:00'}
      className={'bg-green-200'}
      nodeClearClassName={'fill-green-100'}
    >
      <p className={'text-lg font-medium mb-1'}>4233 마음센터 → 남산타워</p>
      <div className={'px-2'}>
        <p className={'my-0.5'}>서울특별시 연남동</p>
        <p className={'my-0.5'}>예약 필수</p>
      </div>
    </PlanProgressionSegment>
  );
}

function PlanProgressionSegment(
  {children, time, className, nodeClearClassName = 'fill-white'}: {
    time: string;
    children: ReactNode;
    className?: string;
    nodeClearClassName?: string;
  }
) {
  return (
    <div className={'flex relative overflow-y-hidden px-2' + (className ? ' ' + className : '')}>
      <p className={'text-neutral-500 mt-2 pt-[1px]'}>{time}</p>
      <svg className={'fill-neutral-300 absolute left-[calc(45px+var(--spacing)*2)]'} width={16} height={200}
           viewBox={"0 0 16 200"}>
        <rect x={6.5} y={0} width={3} height={200}/>
        <circle cx={8} cy={22.5} r={7} className={nodeClearClassName}/>
        <circle cx={8} cy={22.5} r={5} className={"fill-current"}/>
        <circle cx={8} cy={22.5} r={3} className={nodeClearClassName}/>
      </svg>

      <div className={'mt-2 mb-4 ml-[26px]'}>{children}</div>
    </div>
  );
}

function PlanProgressionTail() {
  return (
    <div className={'relative px-2 h-10'}>
      <svg className={'absolute left-[calc(45px+var(--spacing)*2)]'} width={16} height={40} viewBox={"0 0 16 40"}>
        <defs>
          <linearGradient id={'grad'} x1={0} y1={0} x2={0} y2={1}>
            <stop offset={0} stopColor={"var(--color-neutral-300)"}></stop>
            <stop offset={0.8} stopColor={"var(--color-neutral-300)"} stopOpacity={0}></stop>
          </linearGradient>
        </defs>
        <rect x={6.5} y={0} width={3} height={40} fill="url(#grad)"/>
      </svg>
    </div>
  )
}

function FriendDaegari(
  {friend}: {
    friend: FriendInformationType,
  }
) {
  return (
    <motion.div
      key={friend.uid}
      layout={'position'}
      variants={HorizontalListMotionVariants}
      initial={"initial"}
      animate={"animate"}
      exit={"exit"}
      className={'flex flex-col gap-2 items-center max-w-1/4'}
    >
      <img
        src={'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
        alt={friend.name}
        className={'rounded-full h-16 w-16'}
      />
      <p className={'font-medium cursor-default'}>{friend.name}</p>
    </motion.div>
  );
}

export default CorePlan;
