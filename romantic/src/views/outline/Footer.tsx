import {Link} from "react-router-dom";
import {LocationIcon, MagnifyingGlassIcon, PersonIcon, RouteIcon} from "../../assets/svgs/svgs.ts";
import type {ReactElement} from "react";

interface FooterMenuPropsType {
  to: string,
  icon: ReactElement
}

function FooterMenu(
  props: FooterMenuPropsType
) {
  return (
    <Link
      to={props.to}
      className={"h-full flex flex-col justify-center items-center"}
    >
      {props.icon}
    </Link>
  );
}

function Footer() {
  return (
    <footer
      className={
        "fixed bottom-0 left-0 h-[65px] " +
        "w-full grid grid-cols-4 bg-light " +
        "border-t border-t-neutral-300"
      }
    >
      <FooterMenu
        to={"/plan"}
        icon={
          <RouteIcon
            className={"fill-neutral-700"}
          />
        }
      />
      <FooterMenu
        to={"/location"}
        icon={
          <LocationIcon
            className={"fill-neutral-700"}
          />
        }
      />
      <FooterMenu
        to={"/find"}
        icon={
          <MagnifyingGlassIcon
            className={"fill-neutral-700"}
          />
        }
      />
      <FooterMenu
        to={"/profile"}
        icon={
          <PersonIcon
            className={"fill-neutral-700"}
          />
        }
      />
    </footer>
  );
}

export default Footer;
