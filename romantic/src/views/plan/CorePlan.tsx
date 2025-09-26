import {type ReactNode, useState} from "react";
import {DatePicker, Select} from "../elements/Inputs.tsx";

interface StepFramePropsType {
  children: ReactNode;
  title: string;
}

function StepFrame(
  {
    children,
    title
  }: StepFramePropsType
) {
  return (
    <div className={'m-5'}>
      <p className={'text-xl font-medium'}>{title}</p>
      <div className={'pl-4 mt-3'}>
        {children}
      </div>
    </div>
  );
}

function CorePlan() {
  const [dateDate, setDateDate] = useState<string>('');
  const [timeRange, setTimeRange] = useState<number>(0);

  return (
    <>
      <div className={'flex flex-col'}>
        <StepFrame
          title={'누구와 함께하나요?'}
        >
          <p>friend selector</p>
        </StepFrame>
        <StepFrame
          title={'언제 만나는게 좋을까요?'}
        >
          <div className={'flex gap-2'}>
            <DatePicker value={dateDate} setter={setDateDate}/>
            <Select
              keys={[0, 1, 2, 3, 4]}
              options={['시간대', '하루 종일', '오전에', '오후에', '깊은 밤에']}
              value={timeRange}
              setter={setTimeRange}
              placeholder
            />
          </div>
        </StepFrame>

        <StepFrame
          title={'어떤 느낌일까요?'}
        >
          <p>selector</p>
        </StepFrame>
      </div>
    </>
  );
}

export default CorePlan;
