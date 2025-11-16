import {type ReactElement, useEffect, useState} from "react";
import PageState from "love/model/PageState.ts";
import {TextInput} from "../elements/common/Inputs.tsx";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {SearchUsersAPI} from "love/api/UserAPI.ts";
import {lengthCheck, verifyAll} from "../../core/validation.ts";
import Img, {ImageType} from "../elements/common/Imgs.tsx";
import {SkeletonElement, SkeletonFrame} from "../elements/loading/Skeleton.tsx";
import useDebounce from "../../core/debouncedQuery.tsx";
import {PageError} from "../error/ErrorPage.tsx";
import {Link} from "react-router-dom";
import {TextButton} from "../elements/common/Buttons.tsx";
import {XMarkIcon} from "../../assets/svgs/svgs.ts";
import {PageTransitionLayer} from "../elements/hierarchy/HierarchyStructure.tsx";
import {isPageError} from "love/api/APITypes.ts";
import type {SearchedUser} from "love/model/User.ts";

function CoreFind() {
  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [recentSearchedUsers, setRecentSearchedUsers] = useState<SearchedUser[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedQuery = useDebounce(searchQuery);

  function gotoProfile(uid: string, name: string) {
    const isInRecent = recentSearchedUsers.filter(search => search.uid === uid).length > 0;

    if (!isInRecent) {
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(
          [
            {uid: uid, name: name},
            ...recentSearchedUsers
          ].slice(0, 20)
        )
      )
    } else {
      const newRecentSearches = recentSearchedUsers.filter(search => search.uid !== uid);
      newRecentSearches.unshift({uid: uid, name: name});
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(
          newRecentSearches.slice(0, 20)
        )
      )
    }
  }

  function deleteOneSearchHistory(uid: string) {
    const newRecentSearches = recentSearchedUsers.filter(search => search.uid !== uid);
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(newRecentSearches)
    );
    setRecentSearchedUsers(newRecentSearches);
  }

  function deleteSearchHistory() {
    localStorage.setItem("recentSearches", "[]");
    setRecentSearchedUsers([]);
  }

  useEffect(() => {
    const ls = localStorage.getItem("recentSearches");
    let recentSearches: SearchedUser[] = [];
    if (!ls) {
      localStorage.setItem("recentSearches", "[]");
    } else {
      recentSearches = JSON.parse(ls) as SearchedUser[];
    }

    setRecentSearchedUsers(recentSearches);
  }, []);

  useEffect(() => {
    const q = debouncedQuery.trim();

    const validation = verifyAll(
      lengthCheck(q, 1, 30)
    );

    if (validation !== 0) return;

    setWorkState(PageState.WORKING);

    apiAuth<SearchUsersAPI>(
      "/user/search",
      {
        params: {
          name: q
        }
      }
    ).then(res => {
      setSearchedUsers(res.data.users);
      setWorkState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }, [debouncedQuery]);

  let searchDisp: ReactElement = <></>;
  if (searchQuery === "" && recentSearchedUsers.length > 0) {
    searchDisp = (
      <>
        <div className={"flex justify-between items-center mt-3 mb-1"}>
          <p className={"font-medium text-xl"}>최근 검색</p>
          <TextButton onClick={deleteSearchHistory}>
            기록 지우기
          </TextButton>
        </div>
        <div className={"flex flex-col gap-1"}>
          {recentSearchedUsers.map(user => (
            <Link
              key={user.uid}
              className={"flex items-center justify-between py-2"}
              to={"/user/" + user.uid}
              onClick={() => gotoProfile(user.uid, user.name)}
            >
              <div className={"flex items-center gap-3"}>
                <Img
                  src={user.uid}
                  type={ImageType.PROFILE_PICTURE}
                  className={"rounded-full h-10 w-10 aspect-square cursor-pointer"}
                />
                <p className={"font-medium text-lg"}>{user.name}</p>
              </div>
              <button
                className={"px-2"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteOneSearchHistory(user.uid);
                }}
              >
                <XMarkIcon height={18} className={"fill-neutral-400"}/>
              </button>
            </Link>
          ))}
        </div>
      </>
    );
  } else if (searchQuery === "" && recentSearchedUsers.length === 0) {
    searchDisp = (<></>);
  } else {
    const searchedView: ReactElement[] = [];

    if (workState === PageState.WORKING) {
      searchDisp = <CoreFindListSkeleton/>;
    } else if (isPageError(workState)) {
      searchDisp = <PageError pageState={workState}/>
    } else if (workState === PageState.NORMAL) {
      searchedUsers.forEach((user) => {
        searchedView.push(
          <Link
            key={user.uid}
            className={"flex items-center gap-3 py-2"}
            to={"/user/" + user.uid}
            onClick={() => gotoProfile(user.uid, user.name)}
          >
            <Img
              src={user.uid}
              type={ImageType.PROFILE_PICTURE}
              className={"rounded-full h-10 w-10 aspect-square cursor-pointer"}
            />
            <p className={"font-medium text-lg"}>{user.name}</p>
          </Link>
        );
      });
      searchDisp = (
        <div className={"flex flex-col gap-1 mt-3"}>
          {searchedView}
        </div>
      );
    }
  }

  return (
    <PageTransitionLayer className={"p-5"}>
      <TextInput
        placeholder={"검색"}
        value={searchQuery}
        setter={setSearchQuery}
      />
      {searchDisp}
    </PageTransitionLayer>
  );
}

function CoreFindListSkeleton() {
  return (
    <SkeletonFrame className={"flex flex-col gap-1"}>
      <div className={"flex items-center gap-3 py-2"}>
        <SkeletonElement className={"rounded-full h-10 w-10 aspect-square"}/>
        <SkeletonElement expH={24} expW={320}/>
      </div>
      <div className={"flex items-center gap-3 py-2"}>
        <SkeletonElement className={"rounded-full h-10 w-10 aspect-square"}/>
        <SkeletonElement expH={24} expW={320}/>
      </div>
      <div className={"flex items-center gap-3 py-2"}>
        <SkeletonElement className={"rounded-full h-10 w-10 aspect-square"}/>
        <SkeletonElement expH={24} expW={320}/>
      </div>
    </SkeletonFrame>
  );
}

export default CoreFind;
