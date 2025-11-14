import {CheckmarkFillIcon, XCircleFillIcon} from "../../../assets/svgs/svgs.ts";
import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import {DatePicker, Select, TextInput} from "../../elements/common/Inputs.tsx";
import {Form, FormGroup} from "../../elements/common/Form.tsx";
import {Button, TextButton} from "../../elements/common/Buttons.tsx";
import {useEffect, useState} from "react";
import {check, lengthCheck, rangeCheck, regexCheck, verifyAll} from "../../../core/validation.ts";
import {apiAuth, handleAxiosError} from "../../../core/axios/withAxios.ts";
import type {userAPI} from "../../../core/apiResponseInterfaces/user.ts";
import {isPageError, PageState} from "../../../core/apiResponseInterfaces/apiInterface.ts";
import {PageError} from "../../error/ErrorPage.tsx";
import {SkeletonElement, SkeletonFrame} from "../../elements/loading/Skeleton.tsx";
import Spinner from "../../elements/loading/Spinner.tsx";
import CoreEditProfilePicture from "./CoreEditProfilePicture.tsx";
import {BackHeader} from "../../elements/hierarchy/HierarchyStructure.tsx";
import AnimatedSuspense from "../../elements/hierarchy/AnimatedSuspense.tsx";
import Img, {ImageType} from "../../elements/common/Imgs.tsx";

function CoreEditProfile() {
  const myUuid = useAppSelector(state => state.userInfoReducer.uid);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [sex, setSex] = useState<number>(0);
  const [birthday, setBirthday] = useState<string>('');
  const [formState, setFormState] = useState<number>(0);
  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [profilePictureUpdateInterrupt, setProfilePictureUpdateInterrupt] = useState<number>(0);
  const [showingProfilePictureEditDialog, setShowingProfilePictureEditDialog] = useState<boolean>(false);

  function validateForm() {
    const validation = verifyAll(
      lengthCheck(name, 1, 64),
      lengthCheck(email, 1, 64),
      rangeCheck(sex, 1, 3),
      regexCheck(email, /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/),
      regexCheck(birthday, /^(\d{4})-(0[1-9]|1[0-2])-([0-2][1-9]|3[0-1])$/)
    );

    if (validation !== 0) setFormState(validation);
    else {
      setFormState(0);
      submitForm();
    }
  }

  function submitForm() {
    setWorkState(PageState.WORKING);

    apiAuth.patch(
      "/user",
      {
        name: name,
        email: email,
        sex: sex - 1,
        birthday: birthday
      }
    ).then(() => {
      setWorkState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }

  function refreshProfilePicture() {
    setProfilePictureUpdateInterrupt(prev => prev + 1);
  }

  useEffect(() => {
    apiAuth.get<userAPI>(
      "/user"
    ).then(res => {
      setName(res.data.user.name);
      setEmail(res.data.user.email);
      if (res.data.user.email_verified) setVerifiedEmail(res.data.user.email);
      setSex(res.data.user.sex + 1);
      setBirthday(res.data.user.birthday);
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (isPageError(pageState)) return <PageError pageState={pageState}/>

  let emailVerificationCheckmark = <XCircleFillIcon height={20} className={"mt-[-4px] fill-red-600"}
                                                    title={"확인되지 않은 이메일입니다"}/>;
  if (verifiedEmail === email) {
    emailVerificationCheckmark =
      <CheckmarkFillIcon height={20} className={"mt-[-4px] fill-green-600"} title={"확인된 이메일입니다"}/>;
  }

  return (
    <AnimatedSuspense
      pageState={pageState}
      loadingSkeleton={<EditProfileSkeleton/>}
    >
      <BackHeader title={"프로필 수정"}/>

      <div className={'mx-5'}>
        <div className={'my-3'}>
          <Img
            src={myUuid}
            type={ImageType.PROFILE_PICTURE}
            refreshKey={profilePictureUpdateInterrupt}
            className={"mx-auto rounded-full h-20 w-20"}
          />
          <TextButton
            onClick={() => setShowingProfilePictureEditDialog(true)}
            className={"mx-auto my-2"}
          >
            프로필사진 변경
          </TextButton>
        </div>

        <Form className={'py-4'}>
          <FormGroup name={"이름"}>
            <TextInput
              value={name}
              setter={setName}
              placeholder={"이름"}
              autocomplete={"name"}
              disabled={workState === PageState.WORKING}
              error={check(formState, 0)}
            />
          </FormGroup>

          <FormGroup
            name={"이메일"}
            sidecar={emailVerificationCheckmark}
          >
            <TextInput
              value={email}
              setter={setEmail}
              placeholder={"이메일"}
              autocomplete={"email"}
              disabled={workState === PageState.WORKING}
              error={check(formState, 1) || check(formState, 3)}
            />
          </FormGroup>

          <FormGroup name={"성별"}>
            <Select
              keys={[0, 1, 2, 3]}
              options={["성별", "남성", "여성", "기타"]}
              placeholder
              value={sex}
              setter={setSex}
              disabled={workState === PageState.WORKING}
              error={check(formState, 2)}
            />
          </FormGroup>

          <FormGroup name={"생년월일"}>
            <DatePicker
              value={[birthday]}
              setter={(e) => setBirthday(e[0])}
              toDate={new Date()}
              disabled={workState === PageState.WORKING}
              error={check(formState, 4)}
            />
          </FormGroup>

          <FormGroup className={'!flex-row justify-end'}>
            <Button
              disabled={workState === PageState.WORKING}
              onClick={validateForm}
            >확인</Button>
          </FormGroup>
        </Form>

        <CoreEditProfilePicture
          showing={showingProfilePictureEditDialog}
          onClose={() => setShowingProfilePictureEditDialog(false)}
          refresh={refreshProfilePicture}
        />
      </div>
    </AnimatedSuspense>
  );
}

function EditProfileSkeleton() {
  return (
    <SkeletonFrame>
      <BackHeader title={"프로필 수정"}/>

      <div className={'my-3'}>
        <SkeletonElement unit className={"mx-auto rounded-full h-20 w-20"}/>
        <p className={'text-center px-2 py-1 my-2 font-medium text-sky-700'}>프로필사진 변경</p>
      </div>

      <Form className={'py-4'}>
        <FormGroup name={"이름"}>
          <SkeletonElement unit expH={36} className={'w-full my-[3px]'}/>
        </FormGroup>

        <FormGroup name={"이메일"}>
          <SkeletonElement unit expH={36} className={'w-full my-[3px]'}/>
        </FormGroup>

        <FormGroup name={"성별"}>
          <SkeletonElement unit expH={36} className={'w-full my-[3px]'}/>
        </FormGroup>

        <FormGroup name={"생년월일"}>
          <Spinner className={'mx-auto'}/>
        </FormGroup>

        <FormGroup className={'!flex-row justify-end'}>
          <Button disabled={true}>확인</Button>
        </FormGroup>
      </Form>
    </SkeletonFrame>
  );
}

export default CoreEditProfile;
