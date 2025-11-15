//@ts-expect-error ENUM이 뭐가 어때서
enum PageState {
  LOADING,
  WORKING,
  NORMAL,
  NOT_FOUND,
  FORBIDDEN,
  CLIENT_FAULT,
  SERVER_FAULT,
  UNKNOWN_FAULT
}

export default PageState;
