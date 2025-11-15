import type {ReactNode} from "react";
import PageState from "love/model/PageState.ts";
import {PageTransitionLayer} from "./HierarchyStructure.tsx";

function AnimatedSuspense(
  {children, pageState, loadingSkeleton, className}: {
    children: ReactNode;
    pageState: PageState;
    loadingSkeleton: ReactNode;
    className?: string;
  }
) {
  return (
    <PageTransitionLayer className={className}>
      {pageState === PageState.LOADING ? loadingSkeleton : children}
    </PageTransitionLayer>
  );
}

export default AnimatedSuspense;
