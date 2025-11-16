import {Button} from "../../elements/common/Buttons.tsx";
import {type ReactElement, useEffect, useState} from "react";
import type {ThemeMapping} from "love/model/Theme.ts";
import {getThemeMapping} from "../../../core/theme/theme.ts";
import {handleAxiosError} from "../../../core/axios/withAxios.ts";
import {InlineError} from "../../error/ErrorPage.tsx";
import {motion} from "framer-motion";
import ThemeTag from "../../elements/theme/ThemeTag.tsx";
import PageState from "love/model/PageState.ts";

function InitialPreferenceSelector(
  {
    prev, next, blockForm, preferVector, setPreferVector, signInState
  }: {
    prev: () => void;
    next: () => void;
    blockForm: boolean;
    preferVector: number[];
    setPreferVector: (preferVector: number[]) => void;
    signInState: PageState;
  }
) {
  const [themeMapping, setThemeMapping] = useState<ThemeMapping>({});
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  function toggleThemeSelection(uid: number) {
    if (preferVector[uid] === 1) {
      const newPreferVector = [...preferVector];
      newPreferVector[uid] = 0;
      setPreferVector(newPreferVector);
    } else {
      const newPreferVector = [...preferVector];
      newPreferVector[uid] = 1;
      setPreferVector(newPreferVector);
    }
  }

  useEffect(() => {
    getThemeMapping()
      .then(mapping => {
        setThemeMapping(mapping);
        setPageState(PageState.NORMAL);
      })
      .catch(err => handleAxiosError(err, setPageState));
  }, []);

  const ThemeTags: ReactElement[] = [];
  Object.entries(themeMapping).forEach(([uid, theme]) => {
    if (preferVector[parseInt(uid)] === 1) {
      ThemeTags.push(
        <motion.button
          key={uid}
          layout={"position"}
          className={"my-1"}
          onClick={() => toggleThemeSelection(parseInt(uid))}
        >
          <ThemeTag key={uid} theme={theme}/>
        </motion.button>
      );
    } else {
      ThemeTags.push(
        <motion.button
          key={uid}
          layout={"position"}
          className={"my-1"}
          onClick={() => toggleThemeSelection(parseInt(uid))}
        >
          <ThemeTag key={uid} theme={theme} type={"outlined"}/>
        </motion.button>
      );
    }
  });

  return (
    <>
      <p className={"text-2xl text-center font-bold"}>좋아하는 테마를 골라주세요.</p>

      <div className={"flex-grow flex flex-wrap justify-center gap-2 my-2"}>
        {ThemeTags}
      </div>

      <InlineError pageState={pageState}/>
      <InlineError pageState={signInState}/>
      <div className={"w-full flex justify-between"}>
        <Button onClick={prev} disabled={blockForm}>이전</Button>
        <Button onClick={next} disabled={blockForm}>회원가입</Button>
      </div>
    </>
  )
}

export default InitialPreferenceSelector;
