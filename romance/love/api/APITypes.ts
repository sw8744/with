import PageState from "../model/PageState";

function isPageError(pageState: PageState): boolean {
  return (pageState > PageState.NORMAL);
}

export default interface APITypes {
  code: number;
  status: string;
}
export {isPageError};
