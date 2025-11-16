import type {ReactNode} from "react";

interface ChildrenOnlyPropsType {
  children: ReactNode;
}

function FormGroup(
  {children}: ChildrenOnlyPropsType
) {
  return (
    <div className={"mb-4 mt-2 flex flex-col gap-1.5"}>
      {children}
    </div>
  )
}

function Label(
  {
    children
  }: ChildrenOnlyPropsType
) {
  return (
    <p>{children}</p>
  )
}

export {
  FormGroup,
  Label
}
