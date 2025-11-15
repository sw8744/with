import {getLocalizedDayString, toAPIDatetimeString} from "love/datetime.ts";
import {useEffect, useState} from "react";
import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";

function Header() {
  const username = useAppSelector(state => state.userInfoReducer.name);
  const [clock, setClock] = useState<Date>(new Date());
  const MODE = import.meta.env.VITE_APP_ENV;

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date());
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <header
      className={"w-full flex justify-center items-center gap-5 py-3 sticky left-0 top-0 border-b border-neutral-600"}>
      <p className={"text-xl font-medium"}>{toAPIDatetimeString(clock)} {getLocalizedDayString(clock)}요일</p>
      {MODE !== "production" &&
        <p className={"px-3 bg-rose-900 text-rose-200 rounded-full"}>{MODE}</p>
      }
      {username &&
        <p className={"px-3 bg-green-900 text-green-200 rounded-full"}>{username}</p>
      }
      {!username &&
        <p className={"px-3 bg-yellow-900 text-yellow-200 rounded-full"}>AUTH</p>
      }
    </header>
  );
}

export default Header;
