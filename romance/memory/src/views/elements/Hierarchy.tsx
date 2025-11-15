import {Link} from "react-router-dom";
import {type ReactNode, useState} from "react";

interface HierarchyPropsType {
  children?: ReactNode;
  text: string;
  to?: string;
}

function Hierarchy(
  {
    children, text, to
  }: HierarchyPropsType
) {
  const [showingChildren, setShowingChildren] = useState<boolean>(true);

  function toggleChildren() {
    setShowingChildren(!showingChildren);
  }

  if (children) {
    return (
      <div>
        <button className={"text-left w-full"} onClick={toggleChildren}>
          {showingChildren ? "▼ " : "▶ "}
          {text}
        </button>
        {showingChildren &&
          <div className={"ml-2 flex flex-col gap-0.5 mt-0.5"}>
            {children}
          </div>
        }
      </div>
    );
  } else {
    return (
      <Link to={to ?? "#"} className={"w-full hover:underline"}>{text}</Link>
    );
  }
}

export default Hierarchy;
