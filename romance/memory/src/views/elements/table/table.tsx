import type {ReactElement} from "react";

function Table(
  {data, keys}: {
    data: object[];
    keys: string[];
  }
) {
  return (
    <table className={"flex flex-col border border-neutral-600 w-fit"}>
      <tbody>
      <tr>
        {keys.map(k => (
          <th key={k} className={"border border-neutral-600 px-2 py-1 min-w-fit"}>{k}</th>
        ))}
      </tr>
      {data.map((datum, index) => {
        const row: ReactElement[] = [];

        keys.forEach(k => {
          row.push(
            <td key={k} className={"border border-neutral-600 px-2 py-1 min-w-fit"}>
              {String((datum as Record<string, unknown>)[k])}
            </td>
          );
        });

        return (
          <tr key={index}>{row}</tr>
        );
      })}
      </tbody>
    </table>
  );
}

export default Table;
