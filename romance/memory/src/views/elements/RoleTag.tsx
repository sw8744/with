import {Role} from "love/model/User.ts";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import type {ReactElement} from "react";

function RoleTag(
  {role}: { role: string[] }
) {
  return (
    <div className={"flex gap-1.5"}>
      {role.map(r => (
        <span className={"px-2 py-0.5 rounded-full bg-fuchsia-300 text-fuchsia-950"}>{r.toUpperCase()}</span>
      ))}
    </div>
  );
}

function RequireRole(
  {role}: {
    role: Role[]
  }
) {
  const myRole = useAppSelector(state => state.userInfoReducer.role);

  const roleTags: ReactElement[] = [];
  const isRoot = myRole.includes(Role.ROOT);

  for (const r of role) {
    if (isRoot) {
      roleTags.push(
        <span className={"px-2 py-0.5 rounded-full font-medium bg-sky-300 text-sky-950"}>{r.toUpperCase()}</span>
      );
    } else if (myRole.includes(r)) {
      roleTags.push(
        <span
          className={"px-2 py-0.5 rounded-full font-medium bg-emerald-300 text-emerald-950"}>{r.toUpperCase()}</span>
      );
    } else {
      roleTags.push(
        <span className={"px-2 py-0.5 rounded-full font-medium bg-rose-300 text-rose-950"}>{r.toUpperCase()}</span>
      );
    }
  }

  return (
    <div className={"flex gap-1.5 my-4"}>
      {roleTags}
    </div>
  );
}

export {
  RoleTag,
  RequireRole
}
