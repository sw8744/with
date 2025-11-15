import type {ChangeEvent} from "react";

interface TextInputProps {
  placeholder?: string;
  className?: string;
  value?: string;
  setter?: (value: string) => void;
}

function TextInput(
  {
    placeholder, className, value, setter
  }: TextInputProps
) {
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setter?.(e.target.value);
  }

  return (
    <input
      placeholder={placeholder}
      className={
        "px-2 py-1 w-full " +
        "border border-neutral-600 outline-none " +
        "hover:border-sky-700 focus:border-sky-500 transition-colors duration-200" +
        (className ? " " + className : "")
      }
      value={value}
      onChange={onChange}
    />
  );
}

export {
  TextInput
};
