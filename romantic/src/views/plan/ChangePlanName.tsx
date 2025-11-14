import {PencilIcon} from "../../assets/svgs/svgs.ts";
import {useAppDispatch, useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {useState} from "react";
import Dialog from "../elements/common/Dialog.tsx";
import {TextInput} from "../elements/common/Inputs.tsx";
import {Button} from "../elements/common/Buttons.tsx";
import {PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {check, lengthCheck, verifyAll} from "../../core/validation.ts";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import {InlineError} from "../error/ErrorPage.tsx";
import {planActions, PlanRole} from "../../core/redux/PlanReducer.ts";

function ChangePlanName() {
  const planName = useAppSelector(state => state.planReducer.name);
  const planUUID = useAppSelector(state => state.planReducer.uid);
  const myRole = useAppSelector(state => state.planReducer.role);
  const dispatch = useAppDispatch();

  const [name, setName] = useState<string>('')
  const [showingRenameDialog, setShowingRenameDialog] = useState<boolean>(false);
  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);
  const [formState, setFormState] = useState<number>(0);

  if (myRole === PlanRole.OBSERVER) {
    return <p className={"text-2xl font-bold"}>{planName}</p>;
  }

  function openRenameDialog() {
    setName(planName);
    setWorkState(PageState.NORMAL);
    setFormState(0);
    setShowingRenameDialog(true);
  }

  function closeRenameDialog() {
    setShowingRenameDialog(false);
  }

  function changeName() {
    const validation = verifyAll(
      lengthCheck(name, 1, 256)
    );

    if (validation === 0) patchName();
    else setFormState(validation);
  }

  function patchName() {
    setWorkState(PageState.WORKING);

    apiAuth.patch(
      `/plan/${planUUID}/name`,
      {
        name: name
      }
    ).then(() => {
      dispatch(planActions.refresh());
      setWorkState(PageState.NORMAL);
      setShowingRenameDialog(false);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }

  return (
    <div className={"flex items-center gap-3"}>
      <p className={"text-2xl font-bold"}>{planName}</p>
      <button onClick={openRenameDialog}>
        <PencilIcon className={"fill-neutral-500"} width={20}/>
      </button>
      <Dialog
        show={showingRenameDialog}
        onClose={closeRenameDialog}
        closeWhenBackgroundTouch={true}
      >
        <p className={'text-xl font-medium'}>계획 이름 바꾸기</p>
        <TextInput
          value={name}
          setter={setName}
          placeholder={"계획 이름"}
          error={check(formState, 0)}
        />
        <InlineError pageState={workState}/>
        <div className={'flex flex-col gap-2'}>
          <Button onClick={changeName} disabled={workState === PageState.WORKING}>변경</Button>
          <Button theme={'white'} onClick={closeRenameDialog} disabled={workState === PageState.WORKING}>취소</Button>
        </div>
      </Dialog>
    </div>
  );
}

export default ChangePlanName;
