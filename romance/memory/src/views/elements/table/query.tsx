import {check} from "love/validation.ts";
import {TextInput} from "../form/Inputs.tsx";
import {type ReactElement, useEffect, useState} from "react";

interface QueryPropsType {
  keys: string[];
  values: string[];
  setters: ((value: string) => void)[];
  constraints: (((value: string) => boolean) | null)[];
  validationSetter: (value: number) => void;
  comments?: (string | null)[];
}

function Query(
  {
    keys, values, setters, constraints, validationSetter, comments
  }: QueryPropsType
) {
  const [queryState, setQueryState] = useState<number>(0);
  const queryElem: ReactElement[] = [];

  // initial validation
  useEffect(() => {
    let qs = 0;

    for (let i = 0; i < keys.length; i++)
      if (constraints[i]!(values[i])) qs += (1 << i);

    setQueryState(qs);
  }, []);

  useEffect(() => {
    validationSetter(queryState);
  }, [queryState]);

  for (let i = 0; i < keys.length; i++) {
    function onChangeWrapper(value: string) {
      if (constraints[i]) {
        const constraintPass = constraints[i]!(value);
        if (constraintPass && (queryState & (1 << i)) === 0) setQueryState(queryState + (1 << i));
        else if (!constraintPass && (queryState & (1 << i)) !== 0) setQueryState(queryState - (1 << i));
      }

      setters[i](value);
    }

    if (comments?.length === keys.length && comments[i]) {
      queryElem.push(
        <>
          <p>{keys[i]}</p>
          <p>=</p>
          <TextInput
            value={values[i]}
            setter={onChangeWrapper}
          />
          {check(queryState, i) ? <p>✅</p> : <p>❌</p>}
          <p>{comments[i]}</p>
        </>
      );
    } else {
      queryElem.push(
        <>
          <p>{keys[i]}</p>
          <p>=</p>
          <TextInput
            value={values[i]}
            setter={onChangeWrapper}
          />
          {check(queryState, i) ? <p>✅</p> : <p>❌</p>}
          <p/>
        </>
      );
    }
  }

  return (
    <div className={"my-2 pl-2 grid grid-cols-[auto_auto_300px_auto_auto] items-center gap-x-3 gap-y-1.5 w-fit"}>
      {queryElem}
    </div>
  );
}

export default Query;
