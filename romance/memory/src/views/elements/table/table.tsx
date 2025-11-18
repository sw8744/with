import type {CSSProperties, ReactElement, ReactNode} from "react";

function DataTable(
  {data, keys}: {
    data: object[];
    keys: string[];
  }
) {
  return (
    <div className={"max-w-full overflow-x-auto"}>
      <table className={"flex flex-col border border-neutral-600 w-fit"}>
        <tbody>
        <tr>
          {keys.map(k => (
            <th key={k} className={"border border-neutral-600 text-nowrap px-2 py-1"}>{k}</th>
          ))}
        </tr>
        {data.map((datum, index) => {
          const row: ReactElement[] = [];

          keys.forEach(k => {
            row.push(
              <td
                key={k}
                className={"border border-neutral-600 text-nowrap px-2 py-1"}
              >
                {String((datum as Record<string, unknown>)[k])}
              </td>
            );
          });

          return (
            <tr
              key={index}
              className={"odd:bg-neutral-900 even:bg-neutral-800"}
            >{row}</tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
}

function Table(
  {children}: { children: ReactNode }
) {
  return (
    <div className={"max-w-full overflow-x-auto"}>
      <table className={"flex flex-col border border-neutral-600 w-fit"}>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Tr(
  {children}: { children: ReactNode }
) {
  return (
    <tr className={"odd:bg-neutral-900 even:bg-neutral-800"}>{children}</tr>
  );
}

function Th(
  {children}: { children: ReactNode }
) {
  return (
    <th className={"border border-neutral-600 text-nowrap px-2 py-1"}>{children}</th>
  );
}

function Td(
  {children, className, style}: { children: ReactNode, className?: string, style?: CSSProperties }
) {
  return (
    <td
      className={"border border-neutral-600 text-nowrap px-2 py-1" + (className ? ` ${className}` : '')}
      style={style}
    >{children}</td>
  );
}

export {
  DataTable,
  Table, Tr, Th, Td
};
