import {useState} from "react";
import {PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";

//@ts-expect-error enum이 뭐 어때서
enum ImageType {
  PROFILE_PICTURE,
  REGION_THUMBNAIL,
  PLACE_THUMBNAIL,
  ETC
}

interface ImgPropsType {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  type?: ImageType;
  refreshKey?: number;
}

function Img(
  {
    src, alt, className, type, refreshKey
  }: ImgPropsType
) {
  const [loadingState, setLoadingState] = useState<PageState>(PageState.LOADING);

  function loadingSuccess() {
    if (loadingState === PageState.LOADING) setLoadingState(PageState.NORMAL);
  }

  function loadingFault() {
    if (loadingState === PageState.LOADING) setLoadingState(PageState.UNKNOWN_FAULT);
  }

  let url: string;
  if (src && loadingState != PageState.UNKNOWN_FAULT) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(src)) {
      if (type === ImageType.PROFILE_PICTURE) url = `/api/v1/resources/image/profile/${src}`;
      else url = `/api/v1/resources/image/store/${src}`;
    } else {
      url = src;
    }
  } else {
    switch (type) {
      case ImageType.PROFILE_PICTURE:
        url = "/api/v1/resources/image/store/00000000-0000-4000-0000-000000000000";
        break;
      case ImageType.REGION_THUMBNAIL:
        url = "/api/v1/resources/image/store/00000000-0000-4000-0000-000000000001";
        break;
      case ImageType.PLACE_THUMBNAIL:
        url = "/api/v1/resources/image/store/00000000-0000-4000-0000-000000000002";
        break;
      case ImageType.ETC:
      default:
        url = "/api/v1/resources/image/store/00000000-0000-4000-0000-000000000003";
        break;
    }
  }

  if (refreshKey) {
    url += `?t=${refreshKey}`;
  }

  return (
    <img
      src={url}
      alt={alt}
      onLoad={loadingSuccess}
      onError={loadingFault}
      className={
        "bg-neutral-300 transition-opacity " +
        (loadingState === PageState.LOADING ? "opacity-0" : "opacity-100") +
        (className ? ` ${className}` : "")
      }
    />
  );
}

export default Img;
export {
  ImageType
}
