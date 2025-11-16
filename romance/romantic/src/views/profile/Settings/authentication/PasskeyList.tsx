import {useEffect, useState} from "react";
import PageState from "love/model/PageState.ts";
import type {Passkey} from "love/model/Passkey.ts";
import type {ListPasskeyAPI} from "love/api/PasskeyAPI.ts";
import {apiAuth, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import {isPageError} from "../../../../../../love/api/APITypes.ts";
import {InlineError, PageError} from "../../../error/ErrorPage.tsx";
import Img, {ImageType} from "../../../elements/common/Imgs.tsx";
import {
  getTimeDelta,
  isoToDisplayDateString
} from "../../../../../../love/datetime.ts";
import {PencilIcon, TrashIcon} from "../../../../assets/svgs/svgs.ts";
import Dialog from "../../../elements/common/Dialog.tsx";
import {TextInput} from "../../../elements/common/Inputs.tsx";
import {FormGroup} from "../../../elements/common/Form.tsx";
import {Button} from "../../../elements/common/Buttons.tsx";

function PasskeyList(
  {reload, reloader}: {
    reload: number;
    reloader: (x: ((flag: number) => number)) => void;
  }
) {
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);

  useEffect(() => {
    apiAuth.get<ListPasskeyAPI>(
      "/auth/passkey/list"
    ).then(res => {
      setPasskeys(res.data.passkeys);
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, [reload]);

  if (pageState === PageState.LOADING) return <PasskeyListSkeleton/>
  if (isPageError(pageState)) return <PageError pageState={pageState}/>

  return (
    <div className={"flex flex-col gap-2 my-2"}>
      {passkeys.map((passkey) => (
        <Passkey passkey={passkey} reloader={reloader}/>
      ))}
    </div>
  );
}

function Passkey(
  {passkey, reloader}: {
    passkey: Passkey;
    reloader: (x: ((flag: number) => number)) => void;
  }
) {
  const [showingRenameDialog, setShowingRenameDialog] = useState<boolean>(false);
  const [showingDeleteDialog, setShowingDeleteDialog] = useState<boolean>(false);

  const [passkeyName, setPasskeyName] = useState<string>("");

  const [renameState, setRenameState] = useState<PageState>(PageState.NORMAL);
  const [deleteState, setDeleteState] = useState<PageState>(PageState.NORMAL);

  function closeRenameDialog() {
    setRenameState(PageState.NORMAL);
    setShowingRenameDialog(false);
  }

  function closeDeleteDialog() {
    setDeleteState(PageState.NORMAL);
    setShowingDeleteDialog(false);
  }

  function openRenameDialog() {
    setPasskeyName(passkey.name);
    setShowingRenameDialog(true);
  }

  function openDeleteDialog() {
    setShowingDeleteDialog(true);
  }

  function renamePasskey() {
    setRenameState(PageState.WORKING);

    apiAuth.patch(
      "/auth/passkey/" + passkey.uid,
      {
        name: passkeyName
      }
    ).then(() => {
      reloader(x => x + 1);
      setRenameState(PageState.NORMAL);
      closeRenameDialog();
    }).catch(err => {
      handleAxiosError(err, setRenameState);
    });
  }

  function deletePasskey() {
    setDeleteState(PageState.WORKING);

    apiAuth.delete(
      "/auth/passkey/" + passkey.uid
    ).then(() => {
      reloader(x => x + 1);
      setDeleteState(PageState.NORMAL);
      closeDeleteDialog();
    }).catch(err => {
      handleAxiosError(err, setDeleteState);
    });
  }

  return (
    <div
      key={passkey.uid}
      className={
        "flex justify-between my-2 "
      }
    >
      <div className={"flex gap-3"}>
        <Img
          src={passkey.aaguid}
          type={ImageType.AUTHENTICATION_ICON}
          className={"bg-transparent w-16"}
        />
        <div>
          <p className={"text-lg font-medium"}>{passkey.name}</p>
          <div className={"grid grid-cols-[auto_auto] gap-x-3"}>
            <p className={"text-neutral-600"}>마지막 사용</p>
            <p className={"text-neutral-600"}>{getTimeDelta(new Date(passkey.last_used), new Date())}</p>

            <p className={"text-neutral-600"}>생성일</p>
            <p className={"text-neutral-600"}>{isoToDisplayDateString(passkey.created_at)}</p>
          </div>
        </div>
      </div>
      <div className={"flex items-center gap-3"}>
        <button
          className={"hover:bg-black/5 rounded-full transition-colors duration-200"}
          onClick={openRenameDialog}
        >
          <PencilIcon className={"fill-neutral-500 m-2"} height={24} width={24}/>
        </button>
        <button
          className={"hover:bg-black/5 rounded-full transition-colors duration-200"}
          onClick={openDeleteDialog}
        >
          <TrashIcon className={"fill-neutral-500 m-2"} height={24} width={24}/>
        </button>
      </div>
      <Dialog
        show={showingRenameDialog}
        onClose={closeRenameDialog}
        closeWhenBackgroundTouch
      >
        <p className={"text-xl font-bold"}>패스키 이름 바꾸기</p>
        <TextInput
          placeholder={"패스키 이름"}
          value={passkeyName}
          setter={setPasskeyName}
          disabled={renameState === PageState.WORKING}
        />

        <InlineError pageState={renameState}/>

        <div className={'flex flex-col gap-2'}>
          <Button onClick={renamePasskey}>확인</Button>
          <Button
            theme={"white"}
            onClick={closeRenameDialog}
          >취소</Button>
        </div>
      </Dialog>

      <Dialog
        show={showingDeleteDialog}
        onClose={closeDeleteDialog}
        closeWhenBackgroundTouch
      >
        <p className={"text-xl font-bold"}>패스키 지우기</p>
        <div>
          <p className={"font-medium text-center"}>패스키 {passkey.name}을 지울까요?</p>
          <p className={"text-center"}>더이상 이 패스키로 로그인할 수 없습니다.</p>
          <p className={"text-center"}>기기에 저장된 패스키는 삭제되지 않습니다.</p>
        </div>

        <InlineError pageState={renameState}/>

        <div className={'flex flex-col gap-2'}>
          <Button onClick={deletePasskey}>삭제</Button>
          <Button
            theme={"white"}
            onClick={closeDeleteDialog}
          >취소</Button>
        </div>
      </Dialog>
    </div>
  );
}

function PasskeyListSkeleton() {
  return (
    <></>
  );
}

export default PasskeyList;
