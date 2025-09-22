import React from "react";
import {PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";

interface ErrorPageProps {
  errorCode?: number;
  errorTitle?: string;
  errorMessage?: string;
  children?: React.ReactNode;
}

function ErrorPage(props: ErrorPageProps) {
  return (
    <div
      className={
        'w-full h-full flex flex-col gap-5 justify-center items-center my-5'
      }
    >
      <p className={'text-6xl font-bold'}>
        {props.errorCode}
      </p>
      <p className={'text-xl font-bold'}>
        {props.errorTitle}
      </p>
      <p className={'text-lg'}>{props.errorMessage}</p>
      {props.children}
    </div>
  );
}

function PageError(
  {pageState}: { pageState: PageState }
) {
  switch (pageState) {
    case PageState.NOT_FOUND:
      return <ErrorPage errorCode={404} errorTitle={'Not Found'} errorMessage={'찾으시는 페이지가 존재하지 않습니다.'}/>
    case PageState.FORBIDDEN:
      return <ErrorPage errorCode={403} errorTitle={'Forbidden'} errorMessage={'요청 거부'}/>
    case PageState.CLIENT_FAULT:
      return <ErrorPage errorTitle={'잘못된 접근'} errorMessage={'잘못된 접근입니다.'}/>
    case PageState.SERVER_FAULT:
      return <ErrorPage errorCode={500} errorTitle={'Internal Server Error'} errorMessage={'요청을 처리하지 못했습니다.'}/>
    default:
      return <ErrorPage errorTitle={'알 수 없는 오류'} errorMessage={'알 수 없는 오류가 발생하였습니다.'}/>
  }
}

export {
  PageError,
  ErrorPage
};
