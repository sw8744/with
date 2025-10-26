import type {ReactNode} from "react";

function Timeline() {
  return (
    <div className={"flex flex-col"}>
      <div className={"flex gap-2 item-center my-1"}>
        <p className={"text-xl font-medium"}>2025.10.25 월요일</p>
        <p>Possible Precipipation</p>
      </div>

      <PlanPlaceSegment/>
      <PlanMovementTimeSegment/>
      <PlanPlaceSegment/>

      <div className={"flex gap-2 item-center my-1"}>
        <p className={"text-xl font-medium"}>2025.10.26 화요일</p>
        <p>Possible Precipipation</p>
      </div>
      <PlanMovementTimeSegment/>
      <PlanPlaceSegment/>
      <PlanPlaceSegment/>
      <PlanMovementTimeSegment/>
      <PlanPlaceSegment/>

      <PlanProgressionTail/>
    </div>
  );
}

function PlanPlaceSegment() {
  return (
    <PlanProgressionSegment
      time={"18:00"}
    >
      <p className={"text-lg font-medium mb-1"}>4233 마음센터</p>
      <div className={"px-2"}>
        <p className={"my-0.5"}>서울특별시 연남동</p>
        <p className={"my-0.5"}>예약 필수</p>
      </div>
    </PlanProgressionSegment>
  )
}

function PlanMovementTimeSegment() {
  return (
    <PlanProgressionSegment
      time={"19:00"}
      className={"bg-green-200"}
      nodeClearClassName={"fill-green-100"}
    >
      <p className={"text-lg font-medium mb-1"}>4233 마음센터 → 남산타워</p>
      <div className={"px-2"}>
        <p className={"my-0.5"}>서울특별시 연남동</p>
        <p className={"my-0.5"}>예약 필수</p>
      </div>
    </PlanProgressionSegment>
  );
}

function PlanProgressionSegment(
  {children, time, className, nodeClearClassName = "fill-white"}: {
    time: string;
    children: ReactNode;
    className?: string;
    nodeClearClassName?: string;
  }
) {
  return (
    <div className={"flex relative overflow-y-hidden px-2" + (className ? " " + className : "")}>
      <p className={"text-neutral-500 mt-2 pt-[1px]"}>{time}</p>
      <svg className={"fill-neutral-300 absolute left-[calc(45px+var(--spacing)*2)]"} width={16} height={200}
           viewBox={"0 0 16 200"}>
        <rect x={6.5} y={0} width={3} height={200}/>
        <circle cx={8} cy={22.5} r={7} className={nodeClearClassName}/>
        <circle cx={8} cy={22.5} r={5} className={"fill-current"}/>
        <circle cx={8} cy={22.5} r={3} className={nodeClearClassName}/>
      </svg>

      <div className={"mt-2 mb-4 ml-[26px]"}>{children}</div>
    </div>
  );
}

function PlanProgressionTail() {
  return (
    <div className={"relative px-2 h-10"}>
      <svg className={"absolute left-[calc(45px+var(--spacing)*2)]"} width={16} height={40} viewBox={"0 0 16 40"}>
        <defs>
          <linearGradient id={"grad"} x1={0} y1={0} x2={0} y2={1}>
            <stop offset={0} stopColor={"var(--color-neutral-300)"}></stop>
            <stop offset={0.8} stopColor={"var(--color-neutral-300)"} stopOpacity={0}></stop>
          </linearGradient>
        </defs>
        <rect x={6.5} y={0} width={3} height={40} fill="url(#grad)"/>
      </svg>
    </div>
  )
}

export default Timeline;
