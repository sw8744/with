import {Button} from "../../elements/common/Buttons";
import {useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../../core/axios/withAxios.ts";
import PageState from "love/model/PageState.ts";
import {uuidCheck} from "love/validation.ts";
import {Relationship, type RelationshipStateAPI} from "love/api/RelationshipAPI.ts";
import Dialog from "../../elements/common/Dialog.tsx";
import {
  ChevronDownIcon,
  HeartFilledIcon,
  HeartIcon,
  StarHexagonFillIcon,
  StarHexagonIcon
} from "../../../assets/svgs/svgs.ts";
import {PageError} from "../../error/ErrorPage.tsx";
import {isPageError} from "love/api/APITypes.ts";

function EditRelationship(
  {friendUUID, friendName}: { friendUUID: string, friendName: string }
) {
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);
  const [followingRelationship, setFollowingRelationship] = useState<Relationship>(Relationship.NONE);
  const [followerRelationship, setFollowerRelationship] = useState<Relationship>(Relationship.NONE);

  const [showingRelationshipConfig, setShowingRelationshipConfig] = useState<boolean>(false);

  function closeDialog() {
    setShowingRelationshipConfig(false);
  }

  // follower인 경우에만 가능
  function patchRelationship(newRelationship: Relationship) {
    if (newRelationship === followerRelationship) {
      newRelationship = Relationship.FOLLOWING;
      setFollowerRelationship(newRelationship);
    }

    if (!uuidCheck(friendUUID)) return;
    setWorkState(PageState.WORKING);

    apiAuth.patch(
      "/user/follower/" + friendUUID,
      {
        relationship: newRelationship
      }
    ).then(() => {
      setFollowerRelationship(newRelationship);
      setWorkState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }

  function follow() {
    if (!uuidCheck(friendUUID)) return;
    setWorkState(PageState.WORKING);

    apiAuth.post(
      "/user/following",
      {
        friendId: friendUUID,
        relationship: Relationship.FOLLOWING
      }
    ).then(() => {
      setFollowingRelationship(Relationship.FOLLOWING);
      setWorkState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }

  function unfollow() {
    if (!uuidCheck(friendUUID)) return;
    setWorkState(PageState.WORKING);

    apiAuth.delete(
      "/user/following/" + friendUUID
    ).then(() => {
      setFollowingRelationship(Relationship.NONE);
      setWorkState(PageState.NORMAL);
      closeDialog();
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }

  useEffect(() => {
    if (!uuidCheck(friendUUID)) return;

    (async () => {
      const followingState = await apiAuth.get<RelationshipStateAPI>(
        "/user/following/" + friendUUID
      );
      const followerState = await apiAuth.get<RelationshipStateAPI>(
        "/user/follower/" + friendUUID
      );

      setFollowingRelationship(followingState.data.relationship);
      setFollowerRelationship(followerState.data.relationship);
      setPageState(PageState.NORMAL);
    })().catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, [friendUUID]);

  if (isPageError(pageState)) return <PageError pageState={pageState}/>

  return (
    <>
      {followingRelationship === Relationship.NONE && (
        <Button
          className={"!rounded-lg !py-1 w-full"}
          theme={"white"}
          onClick={follow}
          disabled={workState === PageState.WORKING || pageState === PageState.LOADING}
        >팔로우</Button>
      )}
      {(
        followingRelationship === Relationship.FOLLOWING ||
        followingRelationship === Relationship.FRIEND ||
        followingRelationship === Relationship.LIKED
      ) && (
        <Button
          className={"!rounded-lg !py-1 w-full flex gap-2 justify-center items-center"}
          theme={"white"}
          onClick={() => setShowingRelationshipConfig(true)}
        >
          <span>팔로잉</span>
          <ChevronDownIcon height={10} className={"fill-neutral-500"}/>
        </Button>
      )}

      <Dialog
        show={showingRelationshipConfig}
        onClose={closeDialog}
        closeWhenBackgroundTouch
      >
        <p className={'text-xl font-medium'}>{friendName}</p>

        <div className={'flex flex-col gap-2'}>
          {(
            followerRelationship === Relationship.FOLLOWING ||
            followerRelationship === Relationship.FRIEND ||
            followerRelationship === Relationship.LIKED
          ) && (
            <>
              <Button
                theme={"white"}
                className={
                  "flex gap-2 justify-center items-center transition-all duration-200" +
                  (followerRelationship === Relationship.FRIEND ? " bg-yellow-200/70" : " bg-yellow-200/25")
                }
                disabled={workState === PageState.WORKING}
                onClick={() => patchRelationship(Relationship.FRIEND)}
              >
                {followerRelationship === Relationship.FRIEND && (
                  <StarHexagonFillIcon height={24} className={"fill-yellow-500"}/>
                )}
                {followerRelationship !== Relationship.FRIEND && (
                  <StarHexagonIcon height={24} className={"fill-yellow-500"}/>
                )}
                <span>친구</span>
              </Button>
              <Button
                theme={"white"}
                className={
                  "flex gap-2 justify-center items-center transition-all duration-200" +
                  (followerRelationship === Relationship.LIKED ? " bg-rose-200/70" : " bg-rose-200/25")
                }
                disabled={workState === PageState.WORKING}
                onClick={() => patchRelationship(Relationship.LIKED)}
              >
                {followerRelationship === Relationship.LIKED && (
                  <HeartFilledIcon height={20} className={"fill-rose-500"}/>
                )}
                {followerRelationship !== Relationship.LIKED && (
                  <HeartIcon height={20} className={"fill-rose-500"}/>
                )}
                <span>연인</span>
              </Button>
            </>
          )}
          <Button
            theme={"white"}
            disabled={workState === PageState.WORKING}
            onClick={unfollow}
            className={"bg-sky-200/25 hover:bg-sky-200/70 transition-all duration-200"}
          >팔로우 취소</Button>
          <Button
            theme={"white"}
            disabled={workState === PageState.WORKING}
            onClick={closeDialog}
          >닫기</Button>
        </div>
      </Dialog>
    </>
  );
}

export default EditRelationship;
