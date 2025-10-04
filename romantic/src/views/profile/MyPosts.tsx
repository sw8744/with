import {useState} from "react";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {PageError} from "../error/ErrorPage.tsx";
import {SkeletonElement, SkeletonFrame} from "../elements/Skeleton.tsx";

function MyPosts() {
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  if (pageState === PageState.LOADING) return <MyPostSkeleton/>
  if (isPageError(pageState)) return <PageError pageState={pageState}/>

  return (
    <div className={'grid grid-cols-3'}>

    </div>
  );
}

function MyPostSkeleton() {
  return (
    <SkeletonFrame>
      <div className={'grid grid-cols-3 gap-1'}>
        <SkeletonElement className={'aspect-3/4'}/>
        <SkeletonElement className={'aspect-3/4'}/>
        <SkeletonElement className={'aspect-3/4'}/>
        <SkeletonElement className={'aspect-3/4'}/>
        <SkeletonElement className={'aspect-3/4'}/>
        <SkeletonElement className={'aspect-3/4'}/>
        <SkeletonElement className={'aspect-3/4'}/>
        <SkeletonElement className={'aspect-3/4'}/>
        <SkeletonElement className={'aspect-3/4'}/>
      </div>
    </SkeletonFrame>
  );
}

export default MyPosts;
