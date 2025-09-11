import ErrorPage from "./ErrorPage.tsx";
import {useNavigate} from "react-router-dom";
import Stack from "../layout/Stack.tsx";

function NotFound() {
  const navigate = useNavigate();

  return (
    <ErrorPage
      errorCode={404}
      errorTitle={'Not Found'}
      errorMessage={'페이지를 찾을 수 없습니다.'}
    >
      <Stack direction={'row'} className={'gap-5'}>
        <button className={'px-2 py-1 text-blue-600 dark:text-blue-400'} onClick={() => navigate(-1)}>&lt; 이전 페이지
        </button>
        <button className={'px-2 py-1 text-blue-600 dark:text-blue-400'} onClick={() => navigate('/')}>메인 페이지</button>
      </Stack>
    </ErrorPage>
  )
}

export default NotFound;
