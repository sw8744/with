import type {Theme} from "../../../core/model/Theme.ts";

function ThemeTag(
  {theme}: { theme: Theme }
) {
  return (
    <span
      className={'px-4 py-1 rounded-full text-neutral-50'}
      style={{
        backgroundColor: '#' + theme.color,
      }}
    >
      {theme.name}
    </span>
  );
}

export default ThemeTag;
