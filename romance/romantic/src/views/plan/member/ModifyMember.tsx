import {useAppDispatch, useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import {planActions} from "../../../core/redux/PlanReducer.ts";
import {PencilIcon} from "../../../assets/svgs/svgs.ts";
import {useState} from "react";
import Dialog from "../../elements/common/Dialog.tsx";
import PartySelector from "../../planner/PartySelector.tsx";
import {plannerAction} from "../../../core/redux/PlannerReducer.ts";
import type {FriendInformationType} from "love/api/RelationshipAPI.ts";
import {apiAuth, handleAxiosError} from "../../../core/axios/withAxios.ts";
import {InlineError} from "../../error/ErrorPage.tsx";
import {Button} from "../../elements/common/Buttons.tsx";
import PageState from "love/model/PageState.ts";
import {PlanRole} from "love/model/Plan.ts";

function ModifyMember() {
  const myRole = useAppSelector(state => state.planReducer.role);
  const myUuid = useAppSelector(state => state.userInfoReducer.uid);
  const members = useAppSelector(state => state.planReducer.members);
  const plannerMembers = useAppSelector(state => state.plannerReducer.members);
  const planUuid = useAppSelector(state => state.planReducer.uid);

  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);
  const [showingAdditionDialog, setShowingAdditionDialog] = useState(false);

  const dispatch = useAppDispatch();

  function closeDialog() {
    setShowingAdditionDialog(false);
  }

  function changeMember() {
    setWorkState(PageState.WORKING);

    // get delta
    const newMembers: string[] = [];
    for (const member of plannerMembers) {
      if (member.uid == myUuid) continue;
      newMembers.push(member.uid);
    }

    apiAuth.patch(
      `/plan/${planUuid}/members`,
      {
        members: newMembers
      }
    ).then(() => {
      dispatch(planActions.refresh());
      setWorkState(PageState.NORMAL);
      setShowingAdditionDialog(false);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    })
  }

  function openDialog() {
    const membersFriend: FriendInformationType[] = members.map(f => ({uid: f.uid, name: f.name}));
    dispatch(plannerAction.setMember(membersFriend));
    setShowingAdditionDialog(true);
  }

  if (myRole !== PlanRole.HOST && myRole !== PlanRole.COHOST) {
    return null;
  }

  return (
    <>
      <Button
        onClick={openDialog}
        className={'w-fit flex gap-3 my-2'}
      >
        <PencilIcon width={18} className={'fill-neutral-100'}/>
        멤버 편집
      </Button>
      <Dialog
        show={showingAdditionDialog}
        onClose={closeDialog}
        closeWhenBackgroundTouch
      >
        <PartySelector working={workState === PageState.WORKING}>
          <InlineError pageState={workState}/>
          <div className={'flex flex-col gap-2'}>
            <Button onClick={changeMember} disabled={workState === PageState.WORKING}>변경</Button>
            <Button theme={'white'} onClick={closeDialog} disabled={workState === PageState.WORKING}>취소</Button>
          </div>
        </PartySelector>
      </Dialog>
    </>
  );
}

export default ModifyMember;
