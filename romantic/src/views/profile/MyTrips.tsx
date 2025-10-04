import {useState} from "react";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {PageError} from "../error/ErrorPage.tsx";

function MyTrips() {
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  if (pageState === PageState.LOADING) return <MyTripsSkeleton/>
  if (isPageError(pageState)) return <PageError pageState={pageState}/>

  return (
    <></>
  );
}

function MyTripsSkeleton() {
  return (
    <>
    </>
  );
}

export default MyTrips;
