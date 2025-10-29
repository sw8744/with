import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import {type ReactElement} from "react";
import {PlanRole} from "../../../core/redux/PlanReducer.ts";
import type {PlanMemberType} from "../../../core/apiResponseInterfaces/plan.ts";
import ModifyMember from "./ModifyMember.tsx";

function CoreMembers() {
  const members: PlanMemberType[] = useAppSelector(state => state.planReducer.members);
  const myUid = useAppSelector(state => state.userInfoReducer.uid);

  function setRole(uuid: string, role: PlanRole) {
    //todo: 진짜 미안한데 지금 role 변경 기능 구현하기 ㅈㄴ 귀찮음. 해줘
  }

  const memberList: ReactElement[] = [];

  const sortedMembers: PlanMemberType[] = []
  for (const member of members) {
    if (member.uid == myUid) {
      sortedMembers.unshift(member);
    } else sortedMembers.push(member);
  }
  sortedMembers.sort((a, b) => (a.role - b.role));

  for (const member of sortedMembers) {
    const elem = (
      <div className={'flex items-center justify-between py-3'}>
        <div className={'flex gap-3 items-center'}>
          <img
            src={"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
            className={"rounded-full w-10 aspect-square"}
          />
          <p className={'text-lg font-medium'}>{member.name}</p>
        </div>
        <RoleBadge role={member.role} setRole={(role) => setRole(member.uid, role)}/>
      </div>
    );

    if (member.uid === myUid) memberList.unshift(elem);
    else memberList.push(elem);
  }

  return (
    <>
      <div className={'flex flex-col divide-y-2 -mt-3 divide-neutral-300'}>
        {memberList}
        <ModifyMember/>
      </div>
    </>
  );
}

function RoleBadge(
  {role, setRole}: { role: PlanRole, setRole: (role: PlanRole) => void }
) {
  let roleName = "";
  switch (role) {
    case PlanRole.HOST:
      roleName = "짱";
      break;
    case PlanRole.COHOST:
      roleName = "부짱";
      break;
    case PlanRole.MEMBER:
      roleName = "멤버";
      break;
    case PlanRole.OBSERVER:
      roleName = "깍두기";
  }

  //todo: 진짜 미안한데 지금 role 변경 기능 구현하기 ㅈㄴ 귀찮음. 해줘
  const roleColorClass = {
    [PlanRole.HOST]: 'bg-rose-50 border-rose-400 shadow-rose-100',
    [PlanRole.COHOST]: 'bg-amber-100 border-amber-400 shadow-amber-100',
    [PlanRole.MEMBER]: 'bg-green-50 border-green-600 shadow-green-100',
    [PlanRole.OBSERVER]: 'bg-blue-50 border-blue-500 shadow-blue-100',
  }

  return (
    <p
      className={
        'w-17 py-0.5 border-1 shadow-sm text-center rounded-full ' +
        roleColorClass[role]
      }
    >{roleName}</p>
  );
}

export default CoreMembers;
