import {AnimatePresence} from "framer-motion";
import {Outlet} from "react-router-dom";

function CoreLogin() {
  return (
    <div className={"flex flex-col w-full justify-center items-center gap-3"}>
      <p className={"mt-20 mb-5 text-5xl font-extrabold"}>WITH</p>

      <AnimatePresence mode={"popLayout"} initial={false}>
        <Outlet/>
      </AnimatePresence>
    </div>
  );
}

export default CoreLogin;
