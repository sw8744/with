import {Button} from "../elements/Buttons.tsx";
import {type ReactElement, useEffect, useState} from "react";
import type {ThemeMapping} from "../../core/model/Theme.ts";
import {getThemeMapping} from "../../core/theme/theme.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {handleAxiosError} from "../../core/axios/withAxios.ts";
import ThemeTag from "../elements/theme/ThemeTag.tsx";
import {AnimatePresence, motion} from "framer-motion";
import {number} from "motion";
import {useAppDispatch, useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {plannerAction} from "../../core/redux/PlannerReducer.ts";
import {PageError} from "../error/ErrorPage.tsx";
import Spinner from "../elements/Spinner.tsx";

function ThemeSelector(
  {prev, next}: {
    prev: () => void;
    next: () => void;
  }
) {
  const [themeMapping, setThemeMapping] = useState<ThemeMapping>({});
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  const selectedTheme = useAppSelector(state => state.plannerReducer.themes);
  const dispatch = useAppDispatch();

  function toggleThemeSelection(uid: number) {
    if (uid in selectedTheme) {
      const newSelection: ThemeMapping = {};
      Object.entries(selectedTheme).forEach(([uid_ele, theme]) => {
        const ue = number.parse(uid_ele);
        if (ue !== uid) newSelection[ue] = theme;
      });
      dispatch(plannerAction.setTheme(newSelection));
    } else {
      const newSelection: ThemeMapping = {};
      Object.entries(selectedTheme).forEach(([uid, theme]) => {
        newSelection[number.parse(uid)] = theme;
      });
      newSelection[uid] = themeMapping[uid];
      dispatch(plannerAction.setTheme(newSelection));
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

  const themeTagMotionVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
    transition: {
      layout: {
        type: "spring", stiffness: 400, damping: 30
      },
      duration: 0.5,
      ease: "easeInOut"
    }
  }
  const SelectedThemeTags: ReactElement[] = [];
  const ThemeTags: ReactElement[] = [];
  Object.entries(themeMapping).forEach(([uid, theme]) => {
    if (uid in selectedTheme) return;

    ThemeTags.push(
      <motion.button
        key={uid}
        layout={"position"}
        variants={themeTagMotionVariants}
        className={"my-1 cursor-pointer"}
        onClick={() => toggleThemeSelection(number.parse(uid))}
      >
        <ThemeTag key={uid} theme={theme}/>
      </motion.button>
    );
  });
  Object.entries(selectedTheme).forEach(([uid, theme]) => {
    SelectedThemeTags.push(
      <motion.button
        key={uid}
        layout={"position"}
        variants={themeTagMotionVariants}
        className={"my-1 cursor-pointer"}
        onClick={() => toggleThemeSelection(number.parse(uid))}
      >
        <ThemeTag key={uid} theme={theme}/>
      </motion.button>
    );
  });

  if (pageState === PageState.LOADING) {
    return <Spinner/>;
  } else if (isPageError(pageState)) {
    return <PageError pageState={pageState}/>
  }

  return (
    <>
      <div className={"h-full"}>
        <AnimatePresence mode={"popLayout"}>
          {SelectedThemeTags.length !== 0 &&
            <div className={"flex flex-wrap gap-2 my-2 pb-2 border-b border-neutral-400"}>
              {SelectedThemeTags}
            </div>
          }
          <div className={"flex flex-wrap gap-2 my-2"}>
            {ThemeTags}
          </div>
        </AnimatePresence>
      </div>
      <div>
        <div className={"flex justify-between"}>
          <Button onClick={prev}>이전</Button>
          <Button onClick={next}>다음</Button>
        </div>
      </div>
    </>
  );
}

export default ThemeSelector;
