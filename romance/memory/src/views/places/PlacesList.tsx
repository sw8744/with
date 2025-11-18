import Panel from "../elements/layout/panel.tsx";
import {H1, H3} from "../elements/typegraphy/Headers.tsx";
import {Table, Td, Th, Tr} from "../elements/table/table.tsx";
import type {Place} from "love/model/Location.ts";
import {useState} from "react";
import {Button, ButtonGroup} from "../elements/form/Buttons.tsx";
import {apiAuth} from "../../core/axios/withAxios.ts";
import type {LocationPlaceAPI} from "love/api/LocationAPI.ts";
import issueNotification from "../../core/notification/NotificationCenter.ts";
import Query from "../elements/table/query.tsx";
import {check, lengthCheck, rangeCheck, uuidCheck} from "love/validation.ts";
import {Link} from "react-router-dom";

function PlacesList() {
  const [places, setPlaces] = useState<Place[]>([]);

  const [uid, setUid] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [regionUid, setRegionUid] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [limit, setLimit] = useState<string>("100");
  const [queryState, setQueryState] = useState<number>(0);

  function searchPlaces() {
    apiAuth.get<LocationPlaceAPI>(
      "/location/place",
      {
        params: {
          uid: (check(queryState, 0) ? uid : null),
          name: (check(queryState, 1) ? name : null),
          regionUid: (check(queryState, 2) ? regionUid : null),
          address: (check(queryState, 3) ? address : null),
          limit: (check(queryState, 4) ? parseInt(limit) : 100)
        }
      }
    ).then(res => {
      issueNotification(
        "장소 리스트",
        `${res.data.content.length}개의 장소를 검색했습니다.`,
        "success"
      )
      setPlaces(res.data.content);
    }).catch(err => {
      console.error(err);
      issueNotification(
        "장소 리스트",
        "장소를 검색하지 못했습니다.",
        "error"
      );
    })
  }

  return (
    <Panel>
      <H1>장소</H1>

      <H3>검색 쿼리</H3>
      <Query
        keys={["uid", "name", "regionUid", "address", "limit"]}
        values={[uid, name, regionUid, address, limit]}
        setters={[setUid, setName, setRegionUid, setAddress, setLimit]}
        constraints={[
          uuidCheck,
          (value: string) => lengthCheck(value, 1, 64),
          uuidCheck,
          (value: string) => lengthCheck(value, 1, 128),
          (value: string) => {
            const num = parseInt(value);
            return rangeCheck(num, 1, 100);
          }
        ]}
        comments={[null, "음소검색", null, null, "1 - 100"]}
        validationSetter={setQueryState}
      />

      <ButtonGroup>
        <Button onClick={searchPlaces}>검색</Button>
      </ButtonGroup>

      <Table>
        <Tr>
          <Th>uid</Th>
          <Th>이름</Th>
          <Th>설명</Th>
          <Th>주소</Th>
          <Th>좌표</Th>
          <Th>지역</Th>
          <Th>테마</Th>
          <Th>썸네일</Th>
        </Tr>
        {places.map((place) => (
          <Tr key={place.uid}>
            <Td>{place.uid}</Td>
            <Td>{place.name}</Td>
            <Td>{place.description}</Td>
            <Td>{place.address ?? "N/A"}</Td>
            <Td>{place.coordinate ? `(${place.coordinate[0]}, ${place.coordinate[1]})` : "N/A"}</Td>
            <Td><Link to={`/regions/list?uid=${place.region_uid}`}>지역 ↗</Link></Td>
            <Td><Link to={`/themes/place?uid=${place.uid}`}>테마 ↗</Link></Td>
            <Td>{place.thumbnail}</Td>
          </Tr>
        ))}
      </Table>
    </Panel>
  )
}

export default PlacesList;
