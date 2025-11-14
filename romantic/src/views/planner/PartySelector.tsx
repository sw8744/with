import React, {type ChangeEvent, useEffect, useRef, useState} from "react";
import {Checkbox} from "../elements/Inputs.tsx";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import {
  type FriendInformationType,
  Relationship,
  type userFollowingGet
} from "../../core/apiResponseInterfaces/relationship.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {PageError} from "../error/ErrorPage.tsx";
import {SkeletonElement, SkeletonFrame, SkeletonUnit} from "../elements/Skeleton.tsx";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {AnimatePresence, motion} from "framer-motion";
import Spinner from "../elements/Spinner.tsx";
import {Button} from "../elements/Buttons.tsx";
import {useDispatch} from "react-redux";
import {plannerAction} from "../../core/redux/PlannerReducer.ts";
import {HorizontalListMotionVariants} from "../../core/motionVariants.ts";
import Img, {ImageType} from "../elements/Imgs.tsx";

function PartySelector(
  {next, working, children}: {
    next?: () => void;
    working?: boolean;
    children?: React.ReactNode;
  }
) {
  const [friends, setFriends] = useState<FriendInformationType[]>([]);
  const [headUUID, setHeadUUID] = useState<string>("");
  const [finishedLoading, setFinishedLoading] = useState<boolean>(false);
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedFriends = useAppSelector(state => state.plannerReducer.members);
  const dispatch = useDispatch();

  function include(uuid: string, name: string) {
    const toAdd = {
      uid: uuid,
      name: name
    };
    dispatch(plannerAction.setMember([...selectedFriends, toAdd]))
  }

  function exclude(uuid: string) {
    const newSelected = selectedFriends.filter(user => user.uid !== uuid);
    dispatch(plannerAction.setMember(newSelected));
  }

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    const threshold = 3;

    if (target.scrollHeight - target.scrollTop - target.clientHeight <= threshold) loadNext();
  }

  function loadNext() {
    if (finishedLoading || pageState !== PageState.NORMAL) return;

    setPageState(PageState.WORKING);
    apiAuth.get<userFollowingGet>(
      "/user/following",
      {
        params: {
          limit: 30,
          state: Relationship.FRIEND,
          up: true,
          head: headUUID
        }
      }
    ).then(res => {
      setFriends(friends.concat(res.data.followings));
      setPageState(PageState.NORMAL);
      if (res.data.followings.length < 30) setFinishedLoading(true);
      else setHeadUUID(res.data.followings[res.data.followings.length - 1].uid);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }

  useEffect(() => {
    apiAuth.get<userFollowingGet>(
      "/user/following",
      {
        params: {
          limit: 30,
          state: Relationship.FRIEND,
          up: true
        }
      }
    ).then(res => {
      setFriends(
        loadAlreadySelectedFriends(res.data.followings)
      );

      if (res.data.followings.length < 30) setFinishedLoading(true);
      else setHeadUUID(res.data.followings[res.data.followings.length - 1].uid);

      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  function loadAlreadySelectedFriends(loaded: FriendInformationType[]): FriendInformationType[] {
    const additionalFriend: FriendInformationType[] = [];

    for (const friend of selectedFriends) {
      let isExists = false;

      for (const loadedFriend of loaded) {
        if (loadedFriend.uid === friend.uid) {
          isExists = true;
          break;
        }
      }

      if (isExists) {
        let idx = 0;
        for (const loadedFriend of loaded) {
          if (friend.uid === loadedFriend.uid) {
            break;
          } else idx++;
        }
        loaded.splice(idx, 1);
        additionalFriend.push(friend);
      } else {
        (async () => {
          const res = await apiAuth.get<userFollowingGet>(
            "/user/following",
            {
              params: {
                head: friend.uid,
                limit: 1,
                state: 1,
                up: true
              }
            }
          );
          if (res.data.followings.length !== 0) additionalFriend.push(res.data.followings[0]);
        })().catch(err => {
          handleAxiosError(err, setPageState);
        });
      }
    }

    return [...additionalFriend, ...loaded];
  }

  let friendFinder = <></>;
  if (pageState === PageState.LOADING) friendFinder = <FriendsListSkeleton/>;
  else if (isPageError(pageState)) {
    friendFinder = (
      <div className={"flex-grow"}>
        <PageError pageState={pageState}/>
      </div>
    )
  } else if (pageState === PageState.NORMAL || pageState === PageState.WORKING) {
    if (friends.length === 0) {
      friendFinder = (
        <div className={"text-center text-neutral-600"}>
          <p>초대 가능한 친구가 없습니다.</p>
          <p>상대방이 나를 친구로 추가해야 초대가 가능합니다.</p>
        </div>
      );
    } else {
      friendFinder = (
        <div
          className={"flex-grow flex flex-col gap-3 overflow-y-auto"}
          onScroll={onScroll}
          ref={scrollContainerRef}
        >
          {friends.map((friend: FriendInformationType, index: number) => (
            <FriendInList
              key={index}
              uuid={friend.uid}
              name={friend.name}
              selected={selectedFriends.some(f => f.uid === friend.uid)}
              include={include}
              exclude={exclude}
            />
          ))}
          {pageState === PageState.WORKING && <Spinner className={"mx-auto"} size={27}/>}
        </div>
      )
    }
  }

  return (
    <>
      <div className={"w-full"}>
        <div className={"flex gap-3 overflow-x-auto overflow-y-hidden"}>
          <AnimatePresence mode={"popLayout"}>
            {selectedFriends.map((friend) => (
              <motion.div
                key={friend.uid}
                layout={"position"}
                variants={HorizontalListMotionVariants}
                initial={"initial"}
                animate={"animate"}
                exit={"exit"}
                className={"flex flex-col gap-2 items-center max-w-1/4"}
              >
                <Img
                  src={friend.uid}
                  alt={friend.name}
                  type={ImageType.PROFILE_PICTURE}
                  className={"rounded-full h-16 w-16 cursor-pointer"}
                />
                <p className={"font-medium cursor-default"}>{friend.name}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {friendFinder}
      <div>
        <p className={"text-center text-sm text-neutral-500 my-2"}>상대방이 나를 친구로 추가해야 초대할 수 있습니다.</p>
        {!children && (
          /* 새 계획 모드 */
          <div className={"flex justify-end"}>
            <Button onClick={next} disabled={working}>선택 완료</Button>
          </div>
        )}
        {children && children /* 멤버 수정 모드 */}
      </div>
    </>
  );
}

function FriendInList(
  {uuid, name, selected, include, exclude}: {
    uuid: string;
    name: string;
    selected: boolean;
    include: (uuid: string, name: string) => void;
    exclude: (uuid: string) => void;
  }
) {
  function changeParticipation(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) include(uuid, name);
    else exclude(uuid);
  }

  return (
    <Checkbox
      value={selected}
      onChange={changeParticipation}
      className={"flex gap-4 items-center justify-between"}
    >
      <div className={"flex gap-4 items-center"}>
        <Img
          src={uuid}
          type={ImageType.PROFILE_PICTURE}
          className={"w-10 h-10 aspect-1/1 rounded-full"}
          alt={name}
        />
        <p className={"font-medium"}>{name}</p>
      </div>
    </Checkbox>
  );
}

function FriendsListSkeleton() {
  return (
    <SkeletonFrame className={"flex-grow flex flex-col gap-3"}>
      <SkeletonUnit className={"flex gap-4 items-center relative"}>
        <SkeletonElement className={"w-10 h-10 aspect-1/1 rounded-full"}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={"absolute right-0"}
        />
      </SkeletonUnit>
      <SkeletonUnit className={"flex gap-4 items-center relative"}>
        <SkeletonElement className={"w-10 h-10 aspect-1/1 rounded-full"}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={"absolute right-0"}
        />
      </SkeletonUnit>
      <SkeletonUnit className={"flex gap-4 items-center relative"}>
        <SkeletonElement className={"w-10 h-10 aspect-1/1 rounded-full"}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={"absolute right-0"}
        />
      </SkeletonUnit>
      <SkeletonUnit className={"flex gap-4 items-center relative"}>
        <SkeletonElement className={"w-10 h-10 aspect-1/1 rounded-full"}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={"absolute right-0"}
        />
      </SkeletonUnit>
      <SkeletonUnit className={"flex gap-4 items-center relative"}>
        <SkeletonElement className={"w-10 h-10 aspect-1/1 rounded-full"}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={"absolute right-0"}
        />
      </SkeletonUnit>
    </SkeletonFrame>
  );
}

export default PartySelector;
