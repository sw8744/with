import {Button} from "../../elements/common/Buttons.tsx";
import Alert from "../../elements/common/Alert.tsx";

function InitialPreferenceSelector(
  {
    prev, next, blockForm, pageState, preferVector, setPreferVector
  }: {
    prev: () => void;
    next: () => void;
    blockForm: boolean;
    pageState: number;
    preferVector: number[],
    setPreferVector: (preferVector: number[]) => void
  }
) {
  return (
    <div className={"h-full flex flex-col gap-4"}>
      <p className={"text-2xl text-center font-bold"}>좋아하는 테마를 골라주세요.</p>

      <div className={"flex-grow"}></div>

      <Alert variant={"errorFill"} show={pageState === 2}>세션이 만료되었습니다. 다시 로그인해주세요.</Alert>
      <Alert variant={"errorFill"} show={pageState === 3}>잘못된 요청입니다.</Alert>
      <Alert variant={"errorFill"} show={pageState === 4}>회원가입하지 못했습니다.</Alert>
      <div className={"w-full flex justify-between"}>
        <Button onClick={prev} disabled={blockForm}>이전</Button>
        <Button onClick={next} disabled={blockForm}>회원가입</Button>
      </div>
    </div>
  )
}

export default InitialPreferenceSelector;
