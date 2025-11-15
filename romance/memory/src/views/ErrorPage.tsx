import Panel from "./elements/layout/panel.tsx";

function ErrorPage(
  {code, message}: { code: number; message: string }
) {
  return (
    <Panel>
      <p className={"text-4xl font-bold my-2"}>{code}</p>
      <p className={"text-xl font-medium my-2"}>{message}</p>
    </Panel>
  )
}

export default ErrorPage;
