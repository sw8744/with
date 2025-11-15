import type {ReactNode} from "react";

interface ButtonPropsType {
  children: ReactNode;
  onClick?: () => void;
}

function ButtonGroup(
  {children}: { children: ReactNode }
) {
  return (
    <div className={"flex gap-2"}>
      {children}
    </div>
  );
}

function Button(
  {onClick, children}: ButtonPropsType
) {
  return (
    <button
      onClick={onClick}
      className={
        "w-fit px-3 py-1 " +
        "bg-sky-700 hover:bg-sky-600 transition-colors duration-200"
      }
    >
      {children}
    </button>
  )
}

export {
  Button, ButtonGroup
};
