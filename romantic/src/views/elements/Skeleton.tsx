import type {ReactNode} from "react";

function SkeletonFrame(
  {children, noCaption}: { children: ReactNode, noCaption?: boolean }
) {
  return (
    <div role="status" className="w-full animate-pulse">
      {children}
      {!noCaption && <span className="sr-only">로딩중</span>}
    </div>
  );
}

function SkeletonElement(
  {expW, expH, className}: { expW?: number | string, expH?: number | string, className?: string }
) {
  return (
    <div
      className={'bg-neutral-400' + (className ? ' ' + className : '')}
      style={{
        width: expW,
        height: expH
      }}
    />
  )
}

export {
  SkeletonElement,
  SkeletonFrame
}
