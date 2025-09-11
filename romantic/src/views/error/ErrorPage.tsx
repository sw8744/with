import React from "react";

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
        'w-full h-full flex flex-col gap-5 justify-center items-center ' +
        'text-neutral-900 dark:text-neutral-100 my-5'
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

export default ErrorPage;
