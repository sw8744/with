import {Link} from "react-router-dom";

function Header() {
  return (
    <header
      className={
        "w-full shadow px-5 " +
        "flex justify-between"
      }
    >
      <Link to={"/"} className={"py-2 text-3xl asimovian-regular"}>WITH</Link>
    </header>
  );
}

export default Header;
