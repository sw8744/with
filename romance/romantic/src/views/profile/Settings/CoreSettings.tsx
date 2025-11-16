import {BackHeader, PageTransitionLayer} from "../../elements/hierarchy/HierarchyStructure.tsx";
import type {ReactNode} from "react";
import {ChevronRightIcon, DoorOpenIcon, LockFilledIcon, PersonIcon} from "../../../assets/svgs/svgs.ts";
import {Link} from "react-router-dom";

function CoreSettings() {
  return (
    <PageTransitionLayer>
      <BackHeader title={"설정"}/>

      <div className={"flex flex-col gap-1 py-3"}>
        <SettingMenuItem
          icon={<PersonIcon width={30} className={"fill-neutral-800"}/>}
          title={"계정"}
          to={"/settings/account"}
        />
        <SettingMenuItem
          icon={<LockFilledIcon width={30} className={"fill-neutral-800"}/>}
          title={"인증"}
          to={"/settings/auth"}
        />

        <SettingMenuItem
          icon={<DoorOpenIcon width={30} className={"fill-neutral-800"}/>}
          title={"로그아웃"}
          to={"/logout"}
        />
      </div>
    </PageTransitionLayer>
  );
}

interface SettingMenuItemPropsType {
  icon: ReactNode;
  title: string;
  to?: string;
}

function SettingMenuItem(
  {icon, title, to = "#"}: SettingMenuItemPropsType,
) {
  return (
    <Link to={to} className={"flex items-center justify-between px-5 py-2 relative"}>
      <div className={"flex items-center gap-3"}>
        {icon}
        <p className={"text-lg"}>{title}</p>
      </div>

      <ChevronRightIcon height={20} className={"fill-neutral-500"}/>
    </Link>
  );
}

export default CoreSettings;
