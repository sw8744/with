import React, {type ChangeEvent, useEffect, useRef, useState} from "react";
import {Checkbox} from "../elements/Inputs.tsx";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import {type FriendInformationType, type userFollowingGet} from "../../core/apiResponseInterfaces/relationship.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {PageError} from "../error/ErrorPage.tsx";
import {SkeletonElement, SkeletonFrame, SkeletonUnit} from "../elements/Skeleton.tsx";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {AnimatePresence, motion} from "framer-motion";
import Spinner from "../elements/Spinner.tsx";
import {Button} from "../elements/Buttons.tsx";

function PartySelector(
  {selectedFriends, setSelectedFriends, next}: {
    selectedFriends: FriendInformationType[];
    setSelectedFriends: (friends: FriendInformationType[]) => void;
    next: () => void
  }
) {
  const [friends, setFriends] = useState<FriendInformationType[]>([]);
  const [headUUID, setHeadUUID] = useState<string>('');
  const [finishedLoading, setFinishedLoading] = useState<boolean>(false);
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const myName = useAppSelector(state => state.userInfoReducer.name);

  useEffect(() => {
    apiAuth.get<userFollowingGet>(
      '/user/following',
      {
        params: {
          limit: 30,
          state: 1,
          up: true
        }
      }
    ).then(res => {
      setFriends(res.data.followings);
      setPageState(PageState.NORMAL);
      if (res.data.followings.length < 30) setFinishedLoading(true);
      else setHeadUUID(res.data.followings[res.data.followings.length - 1].uid);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  function include(uuid: string, name: string) {
    const toAdd = {
      uid: uuid,
      name: name
    };
    setSelectedFriends([...selectedFriends, toAdd])
  }

  function exclude(uuid: string) {
    const newSelected = selectedFriends.filter(user => user.uid !== uuid);
    setSelectedFriends(newSelected);
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
      '/user/following',
      {
        params: {
          limit: 30,
          state: 1,
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

  let friendFinder = <></>;
  if (pageState === PageState.LOADING) {
    friendFinder = <FriendsListSkeleton/>;
  } else if (isPageError(pageState)) {
    friendFinder = (
      <div className={'flex-grow'}>
        <PageError pageState={pageState}/>
      </div>
    )
  } else if (pageState === PageState.NORMAL || pageState === PageState.WORKING) {
    if (friends.length === 0) {
      friendFinder = (
        <div className={'text-center text-neutral-600'}>
          <p>초대 가능한 친구가 없습니다.</p>
          <p>상대방이 나를 친구로 추가해야 초대가 가능합니다.</p>
        </div>
      );
    } else {
      friendFinder = (
        <div
          className={'flex-grow flex flex-col gap-3 overflow-y-auto'}
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
          {pageState === PageState.WORKING && <Spinner className={'mx-auto'} size={27}/>}
        </div>
      )
    }
  }

  const partyListMotionVariants = {
    initial: {
      opacity: 0,
      y: 3
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.17
      }
    },
    exit: {
      opacity: 0,
      y: 3
    }
  }

  return (
    <>
      <div className={'w-full'}>
        <div className={'flex gap-3 overflow-x-auto'}>
          <div className={'flex flex-col gap-2 items-center max-w-1/4'}>
            <img
              src={'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt={myName ?? '나'}
              className={'rounded-full h-16 w-16 cursor-pointer'}
            />
            <p className={'font-medium cursor-default'}>{myName}</p>
          </div>
          <AnimatePresence mode={'popLayout'}>
            {selectedFriends.map((friend) => (
              <motion.div
                key={friend.uid}
                layout
                variants={partyListMotionVariants}
                initial={"initial"}
                animate={"animate"}
                exit={"exit"}
                className={'flex flex-col gap-2 items-center max-w-1/4'}
              >
                <img
                  src={'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                  alt={friend.name}
                  className={'rounded-full h-16 w-16 cursor-pointer'}
                />
                <p className={'font-medium cursor-default'}>{friend.name}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {friendFinder}
      <div>
        <p className={'text-center text-sm text-neutral-500 my-2'}>상대방이 나를 친구로 추가해야 초대할 수 있습니다.</p>
        <div className={'flex justify-end'}>
          <Button onClick={next}>다음</Button>
        </div>
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
    <div className={'flex gap-4 items-center relative'}>
      <img
        src={'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
        className={'w-10 h-10 aspect-1/1 rounded-full'}
        alt={name}
      />
      <p className={'font-medium'}>{name}</p>
      <Checkbox
        value={selected}
        onChange={changeParticipation}
        className={'absolute right-0'}
      />
    </div>
  );
}

function FriendsListSkeleton() {
  return (
    <SkeletonFrame className={'flex-grow flex flex-col gap-3'}>
      <SkeletonUnit className={'flex gap-4 items-center relative'}>
        <SkeletonElement className={'w-10 h-10 aspect-1/1 rounded-full'}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={'absolute right-0'}
        />
      </SkeletonUnit>
      <SkeletonUnit className={'flex gap-4 items-center relative'}>
        <SkeletonElement className={'w-10 h-10 aspect-1/1 rounded-full'}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={'absolute right-0'}
        />
      </SkeletonUnit>
      <SkeletonUnit className={'flex gap-4 items-center relative'}>
        <SkeletonElement className={'w-10 h-10 aspect-1/1 rounded-full'}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={'absolute right-0'}
        />
      </SkeletonUnit>
      <SkeletonUnit className={'flex gap-4 items-center relative'}>
        <SkeletonElement className={'w-10 h-10 aspect-1/1 rounded-full'}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={'absolute right-0'}
        />
      </SkeletonUnit>
      <SkeletonUnit className={'flex gap-4 items-center relative'}>
        <SkeletonElement className={'w-10 h-10 aspect-1/1 rounded-full'}/>
        <SkeletonElement expH={20} expW={150}/>
        <Checkbox
          value={false}
          setter={() => {
          }}
          className={'absolute right-0'}
        />
      </SkeletonUnit>
    </SkeletonFrame>
  );
}

export default PartySelector;
