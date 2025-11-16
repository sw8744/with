import type {Role} from "love/model/User.ts";

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
  return (
    <div className={"flex gap-1.5 my-4"}>
      {role.map(r => (
        <span
          className={"px-2 py-0.5 rounded-full font-medium bg-emerald-300 text-emerald-950"}>{r.toUpperCase()}</span>
      ))}
    </div>
  );
}

export {
  RoleTag,
  RequireRole
}
