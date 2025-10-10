import type {ChangeEvent} from "react";
import {CheckmarkFillIcon, CircleIcon} from "../../assets/svgs/svgs.ts";

interface TextInputPropsType {
  type?: 'text' | 'password' | 'email'
  value: string;
  setter: (val: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  autocomplete?: 'name' | 'bday-year' | 'bday-month' | 'bday-day' | 'email' | 'username' | 'new-password' | 'current-password' | 'one-time-code' | 'sex' | 'url';
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
  label?: string;
  disable?: boolean;
  error?: boolean;
}

interface DatePickerPropsType {
  value: string;
  setter: (val: string) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

const commonClass = (
  'px-5 py-2 w-full rounded-full border border-neutral-300 ' +
  'border shadow-sm shadow-neutral-200 ' +
  'hover:shadow-md hover:shadow-neutral-300 ' +
  'outline-blue-400 focus:outline-1 focus:border-blue-400 focus:shadow-md focus:shadow-neutral-300 ' +
  'transition-shadow transition-colors duration-200'
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
      type={type ?? 'text'}
      value={value}
      onChange={onValueChange}
      className={
        commonClass +
        (error ? ' border-red-300 shadow-red-300' : '') +
        (type == 'password' && value != '' ? ' tracking-[-5px]' : '') +
        (className ? ' ' + className : '')
      }
      placeholder={placeholder ?? ''}
      autoComplete={autocomplete ?? 'off'}
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
        commonClass + ' pr-8' +
        (error ? ' border-red-300 shadow-red-300' : '') +
        (className ? ' ' + className : '')
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
    value, setter, onChange, className, label, disable, error
  }: CheckboxPropsType
) {
  function onValueChange(e: ChangeEvent<HTMLInputElement>) {
    setter?.(e.target.checked);
    onChange?.(e);
  }

  return (
    <label
      className={
        'cursor-pointer' +
        (className ? ' ' + className : '')
      }
    >
      <input
        type={'checkbox'}
        checked={value}
        onChange={onValueChange}
        className={'peer sr-only'}
        disabled={disable}
      />
      <p>{label}</p>
      {value &&
        <CheckmarkFillIcon
          className={
            'w-[24px] h-[24px] fill-neutral-600' +
            (error ? ' border-red-300 shadow-red-300' : '')
          }
        />
      }
      {!value &&
        <CircleIcon
          className={
            'w-[24px] h-[24px] fill-neutral-600' +
            (error ? ' border-red-300 shadow-red-300' : '')
          }
        />
      }
    </label>
  );
}

function DatePicker(
  {
    className, value, setter, error, disabled
  }
  : DatePickerPropsType
) {
  function onValueChange(event: ChangeEvent<HTMLInputElement>) {
    setter(event.target.value);
  }

  return (
    <input
      type={"date"}
      value={value}
      onChange={onValueChange}
      className={
        commonClass +
        (error ? ' border-red-300 shadow-red-300' : '') +
        (className ? ' ' + className : '')
      }
      disabled={disabled}
    />
  )
}

export {
  TextInput,
  Select,
  Checkbox,
  DatePicker,
}
