enum PageState {
  LOADING,
  NORMAL,
  NOT_FOUND,
  FORBIDDEN,
  CLIENT_FAULT,
  SERVER_FAULT,
  UNKNOWN_FAULT
}

function isPageError(pageState: PageState): boolean {
  return (pageState >= 2 && pageState <= 6);
}

export default interface ApiInterface {
  code: number;
  status: string;
}

export {
  PageState, isPageError
}
