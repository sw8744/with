import {type ChangeEvent, useEffect, useState} from "react";
import {CheckmarkFillIcon, ChevronLeftIcon, ChevronRightIcon, CircleIcon} from "../../../assets/svgs/svgs.ts";
import {dateString} from "../../../core/datetime.ts";

interface TextInputPropsType {
  type?: "text" | "password" | "email"
  value: string;
  setter: (val: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  autocomplete?: "name" | "bday-year" | "bday-month" | "bday-day" | "email" | "username" | "new-password" | "current-password" | "one-time-code" | "sex" | "url";
}

interface SelectPropsType {
  keys: number[];
  options: string[];
  value: number;
  setter: (val: number) => void;
  placeholder?: boolean;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

interface CheckboxPropsType {
  value: boolean;
  setter?: (val: boolean) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  children?: React.ReactNode;
  disable?: boolean;
  error?: boolean;
}

interface DatePickerPropsType {
  value: string[];
  setter: (val: string[]) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  multiple?: boolean;
  fromDate?: Date | null;
  toDate?: Date | null;
  weight?: (date: string) => number;
}

interface DateRangePickerPropsType {
  fromValue: Date | null;
  toValue: Date | null;
  fromSetter: (val: Date | null) => void;
  toSetter: (val: Date | null) => void;
  className?: string;
  disabled?: boolean;
  weight?: (date: string) => number;
}

const commonClass = (
  "px-5 py-2 w-full rounded-full border border-neutral-300 " +
  "border shadow-sm shadow-neutral-200 " +
  "hover:shadow-md hover:shadow-neutral-300 " +
  "outline-blue-400 focus:outline-1 focus:border-blue-400 focus:shadow-md focus:shadow-neutral-300 " +
  "transition-shadow transition-colors duration-200"
);

function TextInput(
  {
    type, value, setter, placeholder, className, autocomplete, error, disabled
  }: TextInputPropsType
) {
  function onValueChange(event: ChangeEvent<HTMLInputElement>) {
    setter(event.target.value);
  }

  return (
    <input
      type={type ?? "text"}
      value={value}
      onChange={onValueChange}
      className={
        commonClass +
        (error ? " border-red-300 shadow-red-300" : "") +
        (type == "password" && value != "" ? " tracking-[-5px]" : "") +
        (className ? " " + className : "")
      }
      placeholder={placeholder ?? ""}
      autoComplete={autocomplete ?? "off"}
      disabled={disabled}
    />
  )
}

function Select(
  {
    keys, options, value, setter, placeholder, className, error, disabled
  }: SelectPropsType
) {
  function onValueChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedKey: number = Number.parseInt(event.target.value);

    if (placeholder && selectedKey == keys[0]) {
      event.preventDefault();
    } else setter(selectedKey);
  }

  return (
    <select
      onChange={onValueChange}
      value={value}
      className={
        commonClass + " pr-8" +
        (error ? " border-red-300 shadow-red-300" : "") +
        (className ? " " + className : "")
      }
      disabled={disabled}
    >
      {keys.map((key, index) => (
        <option value={key}>{options[index]}</option>
      ))}
    </select>
  )
}

function Checkbox(
  {
    value, setter, onChange, className, children, disable, error
  }: CheckboxPropsType
) {
  function onValueChange(e: ChangeEvent<HTMLInputElement>) {
    setter?.(e.target.checked);
    onChange?.(e);
  }

  return (
    <label
      className={
        "cursor-pointer" +
        (className ? " " + className : "")
      }
    >
      <input
        type={"checkbox"}
        checked={value}
        onChange={onValueChange}
        className={"peer sr-only"}
        disabled={disable}
      />
      {children}
      {value &&
        <CheckmarkFillIcon
          className={
            "w-[24px] h-[24px] fill-neutral-600" +
            (error ? " border-red-300 shadow-red-300" : "")
          }
        />
      }
      {!value &&
        <CircleIcon
          className={
            "w-[24px] h-[24px] fill-neutral-600" +
            (error ? " border-red-300 shadow-red-300" : "")
          }
        />
      }
    </label>
  );
}

function DatePicker(
  {
    className, value, setter, error, disabled, multiple, fromDate, toDate, weight
  }: DatePickerPropsType
) {
  const [currentYear, setCurrentYear] = useState<number>(1970);
  const [currentMonth, setCurrentMonth] = useState<number>(1);

  useEffect(() => {
    if (value.length > 0) {
      const sampleDate = new Date(value[0]);
      setCurrentYear(sampleDate.getFullYear());
      setCurrentMonth(sampleDate.getMonth() + 1);
    } else if (fromDate) {
      setCurrentYear(fromDate.getFullYear());
      setCurrentMonth(fromDate.getMonth() + 1);
    } else if (toDate) {
      setCurrentYear(toDate.getFullYear);
      setCurrentMonth(toDate.getMonth() + 1);
    } else {
      const today = new Date();
      setCurrentMonth(today.getMonth() + 1);
      setCurrentYear(today.getFullYear());
    }
  }, []);

  const beginDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysOfMonth = new Date(currentYear, currentMonth, 0).getDate();

  function getRelative(date: number, fix: Date) {
    const yearRelative = (
      currentYear === fix.getFullYear() ? 0 :
        currentYear < fix.getFullYear() ? -1 : 1
    );
    const monthRelative = (
      currentMonth === fix.getMonth() + 1 ? 0 :
        currentMonth < fix.getMonth() + 1 ? -1 : 1
    );
    return (
      yearRelative === 0 ?
        (monthRelative === 0 ?
            (date == fix.getDate() ? 0 :
                date < fix.getDate() ? -1 : 1
            ) : monthRelative
        ) : yearRelative);
  }

  function nextMonth() {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  }

  function lastMonth() {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
      return;
    }
    setCurrentMonth(currentMonth - 1);
  }

  function selectDay(i: number) {
    const selectedDay = dateString(currentYear, currentMonth, i);

    if (selectedDay === null) return;
    if (multiple) {
      if (value.includes(selectedDay)) setter(value.filter(v => v !== selectedDay));
      else setter([...value, selectedDay]);
    } else {
      setter([selectedDay]);
    }
  }

  const calender = [];

  let dayCounter = 0;
  for (let i = 0; i < beginDayOfMonth; i++) {
    calender.push(<p key={i - 99}></p>);
    dayCounter++;
  }

  let isInRange = false;
  for (let i = 1; i <= daysOfMonth; i++) {
    let daySpecificClass = "";
    let caseSpecificClass = "";
    const wt = weight ? weight(dateString(currentYear, currentMonth, i)) : 0;
    if (wt > 0) {
      switch (wt) {
        case 1:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-100";
          break;
        case 2:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-200";
          break;
        case 3:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-300";
          break;
        case 4:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-400";
          break;
        case 5:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-500";
          break;
      }
    }

    if (fromDate && toDate) {
      isInRange = getRelative(i, fromDate) === 1 && getRelative(i, toDate) === -1
    } else if (fromDate) {
      isInRange = getRelative(i, fromDate) === 1
    } else if (toDate) {
      isInRange = getRelative(i, toDate) === -1
    } else {
      isInRange = true;
    }

    if (dayCounter === 0) daySpecificClass += " text-red-700 disabled:text-red-300";
    else if (dayCounter === 6) daySpecificClass += " text-blue-800 disabled:text-blue-300";
    else daySpecificClass += " text-neutral-800 disabled:text-neutral-400"

    if (value.includes(dateString(currentYear, currentMonth, i))) {
      daySpecificClass += " bg-blue-200 hover:!bg-blue-300";
    }

    calender.push(
      <div
        className={"py-1 mx-1.5 mb-[2px]" + caseSpecificClass}
        key={currentMonth + "-" + i}
      >
        <button
          className={
            "w-[32px] p-1 mx-auto rounded-full " +
            "hover:bg-neutral-200 disabled:!bg-transparent disabled:cursor-default " +
            "transition-colors" +
            daySpecificClass
          }
          onClick={() => selectDay(i)}
          disabled={disabled || !isInRange}
        >{i}</button>
      </div>
    );

    dayCounter++;
    if (dayCounter === 7) dayCounter = 0;
  }

  return (
    <div className={className + (error ? " border shadow border-red-300 shadow-red-300" : "")}>
      <div className={"flex justify-between items-center mb-2"}>
        <p className={"font-medium text-lg px-3 py-2"}>{currentYear}년 {currentMonth}월</p>
        <div className={"flex justify-between items-center gap-3 px-1"}>
          <button
            className={
              "fill-neutral-600 w-[34px] aspect-square p-2 rounded-full " +
              "hover:bg-neutral-200 transition-colors"
            }
            onClick={lastMonth}
          >
            <ChevronLeftIcon height={18}/>
          </button>
          <button
            className={
              "fill-neutral-600 w-[34px] aspect-square p-2 rounded-full " +
              "hover:bg-neutral-200 transition-colors"
            }
            onClick={nextMonth}
          >
            <ChevronRightIcon height={18}/>
          </button>
        </div>
      </div>
      <div className={"flex justify-around mb-2 font-medium"}>
        <p>일</p>
        <p>월</p>
        <p>화</p>
        <p>수</p>
        <p>목</p>
        <p>금</p>
        <p>토</p>
      </div>
      <div className={"grid grid-cols-7 text-center"}>
        {calender}
      </div>
    </div>
  );
}

function DateRangePicker(
  {
    className, fromValue, toValue, fromSetter, toSetter, disabled, weight
  }: DateRangePickerPropsType
) {
  const [currentYear, setCurrentYear] = useState<number>(1970);
  const [currentMonth, setCurrentMonth] = useState<number>(1);

  useEffect(() => {
    if (fromValue === null) {
      const today = new Date();
      setCurrentMonth(today.getMonth() + 1);
      setCurrentYear(today.getFullYear());
      return;
    } else {
      setCurrentMonth(fromValue.getMonth() + 1);
      setCurrentYear(fromValue.getFullYear());
    }
  }, []);

  const beginDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysOfMonth = new Date(currentYear, currentMonth, 0).getDate();

  function nextMonth() {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  }

  function lastMonth() {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
      return;
    }
    setCurrentMonth(currentMonth - 1);
  }

  function getFromRelative(date: number) {
    if (fromValue === null) return null;

    const yearRelative = (
      currentYear === fromValue.getFullYear() ? 0 :
        currentYear < fromValue.getFullYear() ? -1 : 1
    );
    const monthRelative = (
      currentMonth === fromValue.getMonth() + 1 ? 0 :
        currentMonth < fromValue.getMonth() + 1 ? -1 : 1
    );
    return (
      yearRelative === 0 ?
        (monthRelative === 0 ?
            (date == fromValue.getDate() ? 0 :
                date < fromValue.getDate() ? -1 : 1
            ) : monthRelative
        ) : yearRelative);
  }

  function getToRelative(date: number) {
    if (toValue === null) return null;

    const yearRelative = (
      currentYear === toValue.getFullYear() ? 0 :
        currentYear < toValue.getFullYear() ? -1 : 1
    );
    const monthRelative = (
      currentMonth === toValue.getMonth() + 1 ? 0 :
        currentMonth < toValue.getMonth() + 1 ? -1 : 1
    );
    return (
      yearRelative === 0 ?
        (monthRelative === 0 ?
            (date == toValue.getDate() ? 0 :
                date < toValue.getDate() ? -1 : 1
            ) : monthRelative
        ) : yearRelative);
  }

  function selectDay(date: number) {
    const fromSelected = fromValue !== null;

    // from이 안 골라지면 to도 안 골라진거니 일단 from 설정
    if (!fromSelected) {
      fromSetter(new Date(currentYear, currentMonth - 1, date));
      toSetter(new Date(currentYear, currentMonth - 1, date));
      return;
    }

    let relative = getFromRelative(date);
    // from이 골라진 채로 from보다 이른 날짜 고르면 from 재설정
    if (relative === -1) {
      fromSetter(new Date(currentYear, currentMonth - 1, date));
      toSetter(new Date(currentYear, currentMonth - 1, date));
      return;
    }

    // from은 골랐고, date > from인데
    if (relative === 1) {
      // from을 골랐는데 to를 안 골랐을 수 없음. 무조건 not null. 근데 ts가 검사하라고 칼들고 협박하니까 일단 to로 셋
      if (toValue === null) {
        toSetter(new Date(currentYear, currentMonth - 1, date));
        return;
      }

      relative = getToRelative(date);

      // from 뒤의 날짜를 고르는데 from - to 밖이라면 to로 설정
      if (relative === 1) {
        toSetter(new Date(currentYear, currentMonth - 1, date));
      }
      // from - to 사이 날짜 고르면 거기를 from으로 재설정
      else if (relative === -1) {
        fromSetter(new Date(currentYear, currentMonth - 1, date));
        toSetter(new Date(currentYear, currentMonth - 1, date));
      }
    }
  }

  const calender = [];

  let dayCounter = 0;
  for (let i = 0; i < beginDayOfMonth; i++) {
    calender.push(<p key={i - 99}></p>);
    dayCounter++;
  }

  let isInRange = false;
  const fromSelected = fromValue !== null;
  const toSelected = toValue !== null;

  const fromRelative = getFromRelative(1);
  const toRelative = getToRelative(1);
  if (fromRelative !== null && toRelative !== null && fromRelative === 1 && toRelative <= 0) isInRange = true;

  for (let i = 1; i <= daysOfMonth; i++) {
    let daySpecificClass = "";
    let caseSpecificClass = "";
    const wt = weight ? weight(dateString(currentYear, currentMonth, i)) : 0;
    if (wt > 0) {
      switch (wt) {
        case 1:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-100";
          break;
        case 2:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-200";
          break;
        case 3:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-300";
          break;
        case 4:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-400";
          break;
        case 5:
          caseSpecificClass += " !mb-0 border-b-2 border-rose-500";
          break;
      }
    }

    if (dayCounter === 0) daySpecificClass = " text-red-700";
    else if (dayCounter === 6) daySpecificClass = " text-blue-800";
    else daySpecificClass = " text-neutral-800"

    const isFrom = fromSelected && (currentYear === fromValue.getFullYear() && currentMonth === fromValue.getMonth() + 1 && i === fromValue.getDate());
    const isTo = toSelected && (currentYear === toValue.getFullYear() && currentMonth === toValue.getMonth() + 1 && i === toValue.getDate());

    if (isFrom && !isTo) {
      calender.push(
        <div className={'py-1 mx-1.5 mb-[2px]' + caseSpecificClass}>
          <div
            className={"-mx-1.5 bg-linear-to-r from-transparent from-50% via-blue-200 via-50% to-blue-100"}
            key={currentMonth + "-" + i}
          >
            <button
              className={
                "w-[32px] p-1 mx-auto rounded-full " +
                "bg-blue-200 hover:bg-blue-300 transition-colors" +
                daySpecificClass
              }
              onClick={() => selectDay(i)}
              disabled={disabled}
            >{i}</button>
          </div>
        </div>
      );
      isInRange = true;
    } else if (!isFrom && isTo) {
      calender.push(
        <div className={'py-1 mx-1.5 mb-[2px]' + caseSpecificClass}>
          <div
            className={"px-1.5 -mx-1.5 bg-linear-to-r from-blue-100 via-blue-200 via-50% to-transparent to-50%"}
            key={currentMonth + "-" + i}
          >
            <button
              className={
                "w-[32px] p-1 mx-auto rounded-full " +
                "bg-blue-200 hover:bg-blue-300 transition-colors" +
                daySpecificClass
              }
              onClick={() => selectDay(i)}
              disabled={disabled}
            >{i}</button>
          </div>
        </div>
      );
      isInRange = false;
    } else if (isFrom && isTo) {
      calender.push(
        <div className={'py-1 mx-1.5 mb-[2px]' + caseSpecificClass}>
          <div
            className={"px-1.5 -mx-1.5"}
            key={currentMonth + "-" + i}
          >
            <button
              className={
                "w-[32px] p-1 mx-auto rounded-full " +
                "bg-blue-200 hover:bg-blue-300 transition-colors" +
                daySpecificClass
              }
              onClick={() => selectDay(i)}
              disabled={disabled}
            >{i}</button>
          </div>
        </div>
      );
    } else if (isInRange) {
      calender.push(
        <div className={'py-1 mx-1.5 mb-[2px]' + caseSpecificClass}>
          <div
            className={"-mx-1.5 bg-blue-100"}
            key={currentMonth + "-" + i}
          >
            <button
              className={
                "w-[32px] p-1 mx-auto rounded-full " +
                "hover:bg-blue-200 transition-colors" +
                daySpecificClass
              }
              onClick={() => selectDay(i)}
              disabled={disabled}
            >{i}</button>
          </div>
        </div>
      );
    } else {
      calender.push(
        <div
          className={'py-1 mx-1.5 mb-[2px]' + caseSpecificClass}
          key={currentMonth + "-" + i}
        >
          <button
            className={
              "w-[32px] p-1 mx-auto rounded-full " +
              "hover:bg-neutral-200 transition-colors" +
              daySpecificClass
            }
            onClick={() => selectDay(i)}
            disabled={disabled}
          >{i}</button>
        </div>
      );
    }
    dayCounter++;
    if (dayCounter === 7) dayCounter = 0;
  }

  return (
    <div className={className}>
      <div className={"flex justify-between mb-2"}>
        <p className={"font-medium text-lg"}>{currentYear}년 {currentMonth}월</p>
        <div className={"flex justify-between items-center gap-3"}>
          <button
            className={
              "fill-neutral-600 w-[34px] aspect-square p-2 rounded-full " +
              "hover:bg-neutral-200 transition-colors"
            }
            onClick={lastMonth}
          >
            <ChevronLeftIcon height={18}/>
          </button>
          <button
            className={
              "fill-neutral-600 w-[34px] aspect-square p-2 rounded-full " +
              "hover:bg-neutral-200 transition-colors"
            }
            onClick={nextMonth}
          >
            <ChevronRightIcon height={18}/>
          </button>
        </div>
      </div>
      <div className={"flex justify-around mb-2 font-medium"}>
        <p>일</p>
        <p>월</p>
        <p>화</p>
        <p>수</p>
        <p>목</p>
        <p>금</p>
        <p>토</p>
      </div>
      <div className={"grid grid-cols-7 text-center"}>
        {calender}
      </div>
    </div>
  );
}

export {
  TextInput,
  Select,
  Checkbox,
  DatePicker,
  DateRangePicker
}
