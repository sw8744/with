import {Button} from "../elements/Buttons.tsx";

function ThemeSelector(
  {themeUUID, setThemeUUID, prev, next}: {
    themeUUID: string[],
    setThemeUUID: (regionList: string[]) => void,
    prev: () => void;
    next: () => void;
  }
) {
  return (
    <>
      <div className={'h-full'}>
      </div>
      <div>
        <div className={'flex justify-between'}>
          <Button onClick={prev}>이전</Button>
          <Button onClick={next}>다음</Button>
        </div>
      </div>
    </>
  );
}

export default ThemeSelector;
