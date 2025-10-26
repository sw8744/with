import type {ReactElement, ReactNode} from "react";

interface FormPropsType {
  children: ReactNode;
  className?: string;
}

interface FormGroupPropsTypes {
  children: ReactNode;
  className?: string;
  sidecar?: ReactElement;
  name?: string;
}

function Form(
  {children, className}: FormPropsType
) {
  return (
    <div
      className={
        "flex flex-col gap-3 items-center " +
        "px-5 w-full" +
        (className ? " " + className : "")
      }
    >
      {children}
    </div>
  );
}

function FormGroup(
  {children, className, name, sidecar}: FormGroupPropsTypes
) {
  return (
    <div
      className={
        "flex flex-col gap-1 items-baseline w-full max-w-[300px]" +
        (className ? " " + className : "")
      }
    >
      <div className={"flex gap-1.5 items-center"}>
        <p className={"pl-2 font-bold"}>{name}</p>
        {sidecar}
      </div>
      {children}
    </div>
  )
}

export {Form, FormGroup};
