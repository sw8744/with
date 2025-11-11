import {type ReactElement, useEffect, useState} from "react";
import type {ThemeMapping} from "../../../core/model/Theme.ts";
import {isPageError, PageState} from "../../../core/apiResponseInterfaces/apiInterface.ts";
import {getThemeMapping} from "../../../core/theme/theme.ts";
import {handleAxiosError} from "../../../core/axios/withAxios.ts";
import {AnimatePresence, motion} from "framer-motion";
import {number} from "motion";
import ThemeTag from "../../elements/theme/ThemeTag.tsx";
import {PageError} from "../../error/ErrorPage.tsx";
import {ThemeTagMotionVariants} from "../../../core/motionVariants.ts";
import {SkeletonElement, SkeletonFrame} from "../../elements/Skeleton.tsx";

function ThemeSearch() {
  const [themeMapping, setThemeMapping] = useState<ThemeMapping>({});
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  const [selectedTheme, setSelectedTheme] = useState<ThemeMapping>({});

  function toggleThemeSelection(uid: number) {
    if (uid in selectedTheme) {
      const newSelection: ThemeMapping = {};
      Object.entries(selectedTheme).forEach(([uid_ele, theme]) => {
        const ue = number.parse(uid_ele);
        if (ue !== uid) newSelection[ue] = theme;
      });
      setSelectedTheme(newSelection);
    } else {
      const newSelection: ThemeMapping = {};
      Object.entries(selectedTheme).forEach(([uid, theme]) => {
        newSelection[number.parse(uid)] = theme;
      });
      newSelection[uid] = themeMapping[uid];
      setSelectedTheme(newSelection);
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

  const SelectedThemeTags: ReactElement[] = [];
  const ThemeTags: ReactElement[] = [];
  Object.entries(themeMapping).forEach(([uid, theme]) => {
    if (uid in selectedTheme) return;

    ThemeTags.push(
      <motion.button
        key={uid}
        layout={"position"}
        variants={ThemeTagMotionVariants}
        className={"my-1"}
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
        variants={ThemeTagMotionVariants}
        className={"my-1"}
        onClick={() => toggleThemeSelection(number.parse(uid))}
      >
        <ThemeTag key={uid} theme={theme}/>
      </motion.button>
    );
  });

  if (pageState === PageState.LOADING) {
    return <ThemeSearchSkeleton/>;
  } else if (isPageError(pageState)) {
    return <PageError pageState={pageState}/>
  }

  return (
    <div className={'mx-[14px]'}>
      <p className={'text-2xl font-medium'}>어떤 느낌의 놀러갈 곳을 찾고 있나요?</p>
      <AnimatePresence mode={"popLayout"}>
        {SelectedThemeTags.length !== 0 &&
          <div className={"flex flex-wrap gap-2 my-2 pb-2 border-b border-neutral-300"}>
            {SelectedThemeTags}
          </div>
        }
        <div className={"flex flex-wrap gap-2 my-2"}>
          {ThemeTags}
        </div>
      </AnimatePresence>
      <div className={'grid grid-cols-2'}>

      </div>
    </div>
  );
}

function ThemeSearchSkeleton() {
  return (
    <div className={'mx-[14px]'}>
      <SkeletonFrame>
        <SkeletonElement unit expH={32} expW={240} className={'mb-3'}/>
        <div className={"flex flex-wrap gap-2 my-2"}>
          {Array.from({length: 20}).map((_, index) => (
            <SkeletonElement key={index} unit className={"px-4 py-1 rounded-full"} expH={24}
                             expW={60 + Math.sin(index * 30) * 10}/>
          ))}
        </div>
      </SkeletonFrame>
    </div>
  );
}

export default ThemeSearch;
