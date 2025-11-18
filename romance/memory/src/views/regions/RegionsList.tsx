import Panel from "../elements/layout/panel.tsx";
import {H1, H3} from "../elements/typegraphy/Headers.tsx";
import {DataTable} from "../elements/table/table.tsx";
import type {Region} from "love/model/Location.ts";
import {useEffect, useState} from "react";
import {Button, ButtonGroup} from "../elements/form/Buttons.tsx";
import {apiAuth} from "../../core/axios/withAxios.ts";
import type {LocationPlaceAPI} from "love/api/LocationAPI.ts";
import issueNotification from "../../core/notification/NotificationCenter.ts";
import Query from "../elements/table/query.tsx";
import {check, lengthCheck, rangeCheck, uuidCheck} from "love/validation.ts";
import {useSearchParams} from "react-router-dom";

function RegionsList() {
  const [queryParams] = useSearchParams();
  const queryUid = queryParams.get("uid");

  const [regions, setRegions] = useState<Region[]>([]);

  const [uid, setUid] = useState<string>(queryUid ?? "");
  const [name, setName] = useState<string>("");
  const [limit, setLimit] = useState<string>("100");
  const [queryState, setQueryState] = useState<number>(0);

  function searchPlaces(ruid?: string) {
    apiAuth.get<LocationPlaceAPI>(
      "/location/region",
      {
        params: {
          uid: ruid ?? (check(queryState, 0) ? uid : null),
          name: (check(queryState, 1) ? name : null),
          limit: (check(queryState, 4) ? parseInt(limit) : 100)
        }
      }
    ).then(res => {
      issueNotification(
        "지역 리스트",
        `${res.data.content.length}개의 지역을 검색했습니다.`,
        "success"
      )
      setRegions(res.data.content);
    }).catch(err => {
      console.error(err);
      issueNotification(
        "지역 리스트",
        "지역을 검색하지 못했습니다.",
        "error"
      );
    })
  }

  useEffect(() => {
    const ruid = queryParams.get("uid");
    if (ruid) {
      searchPlaces(ruid);
    }
  }, [queryParams]);

  return (
    <Panel>
      <H1>지역</H1>

      <H3>검색 쿼리</H3>
      <Query
        keys={["uid", "name", "limit"]}
        values={[uid, name, limit]}
        setters={[setUid, setName, setLimit]}
        constraints={[
          uuidCheck,
          (value: string) => lengthCheck(value, 1, 64),
          (value: string) => {
            const num = parseInt(value);
            return rangeCheck(num, 1, 100);
          }
        ]}
        validationSetter={setQueryState}
        comments={[null, "음소검색", "1 - 100"]}
      />
      <p>지역은 lazy하게 검색됩니다.</p>

      <ButtonGroup>
        <Button onClick={searchPlaces}>검색</Button>
      </ButtonGroup>

      <DataTable
        keys={["uid", "name", "description", "thumbnail"]}
        data={regions}
      />
    </Panel>
  )
}

export default RegionsList;
