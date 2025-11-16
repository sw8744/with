import type {ReactNode} from "react";

interface CaptionPropsType {
  children: ReactNode;
}

function Caption(
  {children}: CaptionPropsType
) {
  return (
    <div className={"text-neutral-300"}>
      {children}
    </div>
  )
}

export default Caption;
