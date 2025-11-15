import type {ReactNode} from "react";

interface ChildrenOnlyPropsType {
  children: ReactNode;
}

function FormGroup(
  {children}: ChildrenOnlyPropsType
) {
  return (
    <div className={"mb-4 flex flex-col gap-2"}>
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
