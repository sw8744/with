import type {ReactNode} from "react";

function Panel(
  {children}: { children: ReactNode }
) {
  return (
    <div className={"px-4"}>
      {children}
    </div>
  )
}

export default Panel;
