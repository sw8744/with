import {Link} from "react-router-dom";
import {LocationIcon, PersonIcon, RouteIcon} from "../../assets/svgs/svgs.ts";
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
      className={'py-4 flex flex-col justify-center items-center'}
    >
      {props.icon}
    </Link>
  );
}

function Footer() {
  return (
    <footer
      className={
        'w-full grid grid-cols-3 ' +
        'border-t border-t-neutral-300'
      }
    >
      <FooterMenu
        to={'/course'}
        icon={
          <RouteIcon
            className={'fill-neutral-700'}
          />
        }
      />
      <FooterMenu
        to={'/location'}
        icon={
          <LocationIcon
            className={'fill-neutral-700'}
          />
        }
      />
      <FooterMenu
        to={'/profile'}
        icon={
          <PersonIcon
            className={'fill-neutral-700'}
          />
        }
      />
    </footer>
  );
}

export default Footer;
