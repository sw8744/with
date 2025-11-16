import type {Theme} from "love/model/Theme.ts";

function ThemeTag(
  {
    theme, type = "filled"
  }: { theme: Theme, type?: "filled" | "outlined" }
) {
  if (type === "outlined") {
    return (
      <span
        className={"px-4 py-1 rounded-full text-black border-2 transition-all duration-200"}
        style={{
          backgroundColor: "#" + theme.color + "00",
          borderColor: "#" + theme.color,
        }}
      >
        {theme.name}
      </span>
    );
  } else if (type === "filled") {
    return (
      <span
        className={"px-4 py-1 rounded-full text-neutral-50 border-2 transition-all duration-200 "}
        style={{
          backgroundColor: "#" + theme.color,
          borderColor: "#" + theme.color,
        }}
      >
        {theme.name}
        </span>
    );
  }
}

export default ThemeTag;
