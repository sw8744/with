import Dialog from "../../../elements/common/Dialog.tsx";
import {type ChangeEvent, useEffect, useRef, useState} from "react";
import {Button} from "../../../elements/common/Buttons.tsx";
import {apiAuth, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import {InlineError} from "../../../error/ErrorPage.tsx";
import PageState from "love/model/PageState.ts";

function CoreEditProfilePicture(
  {showing, onClose, refresh}: {
    showing: boolean;
    onClose: () => void;
    refresh: () => void;
  }
) {
  const profileSelectLabelRef = useRef<HTMLLabelElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files ? e.target.files[0] : null;
    setSelectedFile(file);
  }

  async function uploadProfilePicture() {
    if (!selectedFile) return;
    setWorkState(PageState.WORKING);

    try {
      const imageBitmap = await createImageBitmap(selectedFile);

      const canvas = document.createElement("canvas");
      const size = 96;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setWorkState(PageState.CLIENT_FAULT);
        return;
      }

      const minSide = Math.min(imageBitmap.width, imageBitmap.height);
      const sx = (imageBitmap.width - minSide) / 2;
      const sy = (imageBitmap.height - minSide) / 2;

      ctx.drawImage(
        imageBitmap,
        sx, sy, minSide, minSide,
        0, 0, size, size
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );
      if (!blob) {
        setWorkState(PageState.CLIENT_FAULT);
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "pp.jpg");

      await apiAuth.patch(
        "/user/picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      refresh();
      setWorkState(PageState.NORMAL);
      onClose();
    } catch (e) {
      handleAxiosError(e, setWorkState);
    }
  }

  useEffect(() => {
    if (profileSelectLabelRef && showing) profileSelectLabelRef.current?.click();
  }, [profileSelectLabelRef, showing]);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  return (
    <Dialog
      show={showing}
      onClose={onClose}
      closeWhenBackgroundTouch
    >
      <label
        htmlFor={"profile-picture-selection"}
        className={"cursor-pointer relative"}
        ref={profileSelectLabelRef}
      >
        {!previewUrl &&
          <p className={"text-center font-medium"}>프로필사진</p>
        }
        {previewUrl && (
          <>
            <img
              src={previewUrl}
              alt={"선택된 프로필 사진"}
              className={"w-full shadow-md brightness-50"}
            />
            <div className={"absolute left-0 top-0 w-full h-full flex"}>
              <img
                src={previewUrl}
                alt={"선택된 프로필 사진"}
                className={"mx-auto aspect-square rounded-full"}
              />
            </div>
          </>
        )}
      </label>
      <input
        type={"file"}
        id={"profile-picture-selection"}
        accept={"image/*"}
        multiple={false}
        onChange={onFileChange}
        className={"hidden"}
      />

      <InlineError pageState={workState}/>

      <div className={'flex flex-col gap-2'}>
        <Button theme={"white"} onClick={onClose}>취소</Button>
        <Button onClick={uploadProfilePicture} disabled={workState === PageState.WORKING}>확인</Button>
      </div>
    </Dialog>
  );
}

export default CoreEditProfilePicture;
