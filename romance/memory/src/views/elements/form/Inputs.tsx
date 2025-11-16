import type {ChangeEvent} from "react";

interface TextInputProps {
  placeholder?: string;
  className?: string;
  value?: string;
  setter?: (value: string) => void;
  error?: boolean;
}

function TextInput(
  {
    placeholder, className, value, setter, error
  }: TextInputProps
) {
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setter?.(e.target.value);
  }

  return (
    <input
      placeholder={placeholder}
      className={
        "px-2 py-1 w-full transition-colors duration-200 border outline-none " +
        (error ?
            "border-rose-200 hover:border-rose-300 focus:border-rose-400" :
            "border-neutral-600 hover:border-sky-700 focus:border-sky-500"
        ) +
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
