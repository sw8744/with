import {Role} from "love/model/User.ts";
import Panel from "../elements/layout/panel.tsx";
import {RequireRole} from "../elements/RoleTag.tsx";
import {FormGroup, Label} from "../elements/form/General.tsx";
import {TextInput} from "../elements/form/Inputs.tsx";
import {type ReactElement, useEffect, useState} from "react";
import {Button, ButtonGroup} from "../elements/form/Buttons.tsx";
import {apiAuth} from "../../core/axios/withAxios.ts";
import type {PlaceThemeRequestAPI} from "love/api/ThemeAPI.ts";
import issueNotification from "../../core/notification/NotificationCenter.ts";
import type {ThemeMapping} from "love/model/Theme.ts";
import {getThemeMapping} from "../../core/theme/theme.ts";
import {Table, Td, Th, Tr} from "../elements/table/table.tsx";
import ThemeTag from "../elements/theme/ThemeTag.tsx";
import {useSearchParams} from "react-router-dom";

function ThemesPlace() {
  const [queryParams] = useSearchParams();
  const queryUid = queryParams.get("uid");

  const [placeUid, setPlaceUid] = useState<string>(queryUid ?? "");
  const [theme, setTheme] = useState<number[]>([]);
  const [themeMapping, setThemeMapping] = useState<ThemeMapping>({});

  function loadTheme(puid?: string) {
    getThemeMapping()
      .then(mapping => setThemeMapping(mapping))
      .catch(err => {
          console.error(err);
          issueNotification(
            "테마 캐시",
            "테마 캐시를 로딩하지 못했습니다.",
            "error"
          );
        }
      );

    apiAuth.get<PlaceThemeRequestAPI>(
      "/recommendation/theme/place/" + (puid ?? placeUid)
    ).then(res => {
      setTheme(res.data.themes);
      issueNotification(
        "장소 테마",
        "장소 테마를 불러왔습니다..",
        "success"
      )
    }).catch(err => {
      issueNotification(
        "장소 테마",
        "장소 테마를 불러오지 못했습니다.\n" + err.message,
        "error"
      )
    });
  }

  useEffect(() => {
    const puid = queryParams.get("uid");
    if (puid) {
      loadTheme(puid);
    }
  }, [queryParams]);

  const themeElements: ReactElement[] = [];

  for (let i = 0; i < theme.length; i++) {
    const mapping = themeMapping[i];
    let color = "";
    if (theme[i] > 0) color = `rgba(0, 255, 0, ${Math.min(theme[i] * 0.7, 0.7)})`;
    else if (theme[i] < 0) color = `rgba(255, 0, 0, ${Math.min(-theme[i] * 0.7, 0.7)})`;

    const setters: ReactElement[] = [];
    for (let x = 1.0; x >= -1.0; x -= 0.1) {
      let color = "";
      if (x > 0) color = `rgba(0, 255, 0, ${Math.min(x * 0.7, 0.7)})`;
      else color = `rgba(255, 0, 0, ${Math.min(-x * 0.7, 0.7)})`;

      setters.push(
        <td
          className={"border border-neutral-600 bg-black p-0 relative"}
        >
          <button
            className={"absolute inset-0 border-2 border-transparent hover:border-indigo-300 transition-colors"}
            style={{backgroundColor: color}}
            onClick={() => changeThemeVal(i, x)}
          />
        </td>
      );
    }

    if (mapping) {
      themeElements.push(
        <Tr key={i}>
          <Td>{i}</Td>
          <Td className={"py-3"}><ThemeTag theme={mapping}/></Td>
          <Td
            style={{
              backgroundColor: color
            }}
          >{theme[i].toFixed(6)}</Td>
          {setters}
        </Tr>
      );
    } else {
      themeElements.push(
        <Tr key={i}>
          <Td>{i}</Td>
          <Td>N/A</Td>
          <Td
            style={{
              backgroundColor: color
            }}
          >{theme[i].toFixed(6)}</Td>
          {setters}
        </Tr>
      );
    }
  }

  function changeThemeVal(uid: number, value: number) {
    const newTheme = [...theme];
    newTheme[uid] = value;
    setTheme(newTheme);
  }

  function setThemeToServer() {
    apiAuth.patch(
      "/location/place/" + placeUid,
      {
        theme: theme
      }
    ).then(() => {
      loadTheme();
      issueNotification(
        "장소 테마",
        "장소 테마를 설정했습니다.",
        "success"
      );
    }).catch(err => {
      console.log(err);
      issueNotification(
        "장소 테마",
        "장소 테마를 설정하지 못했습니다.\n" + err.message,
        "error"
      );
    });
  }

  return (
    <Panel>
      <RequireRole role={[Role.PLACE_EDIT]}/>

      <FormGroup>
        <Label>장소 UID</Label>
        <TextInput
          value={placeUid}
          setter={setPlaceUid}
          placeholder={"장소 UID"}
        />
        <ButtonGroup>
          <Button onClick={loadTheme}>로드</Button>
          <Button onClick={setThemeToServer}>설정</Button>
        </ButtonGroup>
      </FormGroup>

      <Table>
        <Tr>
          <Th>UID</Th>
          <Th>테마 이름</Th>
          <Th>가중치</Th>
          <Th>1.0</Th>
          <Th>0.9</Th>
          <Th>0.8</Th>
          <Th>0.7</Th>
          <Th>0.6</Th>
          <Th>0.5</Th>
          <Th>0.4</Th>
          <Th>0.3</Th>
          <Th>0.2</Th>
          <Th>0.1</Th>
          <Th>0.0</Th>
          <Th>-0.1</Th>
          <Th>-0.2</Th>
          <Th>-0.3</Th>
          <Th>-0.4</Th>
          <Th>-0.5</Th>
          <Th>-0.6</Th>
          <Th>-0.7</Th>
          <Th>-0.8</Th>
          <Th>-0.9</Th>
          <Th>-1.0</Th>
        </Tr>
        {themeElements}
      </Table>
    </Panel>
  );
}

export default ThemesPlace;
