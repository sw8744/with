import {DatePicker} from "../elements/Inputs.tsx";
import {useState} from "react";

function DatePoll() {
  const [selectedDates, setSelectedDates] = useState<string>('');

  return (
    <div>
      <p className={'text-xl font-medium'}>언제 놀러갈지 투표해주세요</p>
      <DatePicker
        value={selectedDates}
        setter={setSelectedDates}
        className={'my-2'}
      />
    </div>
  );
}

export default DatePoll;
