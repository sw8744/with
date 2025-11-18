import Panel from "../elements/layout/panel.tsx";
import {H1} from "../elements/typegraphy/Headers.tsx";
import {DataTable} from "../elements/table/table.tsx";
import type {ThemeMapping} from "love/model/Theme.ts";
import {useEffect, useState} from "react";
import {getThemeMapping, resetThemeCache} from "../../core/theme/theme.ts";
import issueNotification from "../../core/notification/NotificationCenter.ts";
import {Button, ButtonGroup} from "../elements/form/Buttons.tsx";

function ThemesList() {
  const [data, setData] = useState<ThemeMapping>({});

  function reloadThemes() {
    resetCache();
    loadThemes();
  }

  function resetCache() {
    resetThemeCache();
    setData({});
    issueNotification(
      "테마 캐시",
      "테마 캐시를 초기화했습니다.",
      "success"
    )
  }

  function loadThemes() {
    getThemeMapping()
      .then(res => {
        setData(res);
      }).catch(err => {
      console.error(err);
      issueNotification(
        "테마 캐시",
        "테마 캐시를 불러오지 못했습니다.",
        "error"
      );
    });
  }

  useEffect(() => {
    loadThemes();
  }, []);

  const themeData = [];
  for (const [id, theme] of Object.entries(data)) {
    themeData.push({
      uid: id,
      name: theme.name,
      color: theme.color
    });
  }

  return (
    <Panel>
      <H1>테마 리스트</H1>
      <ButtonGroup>
        <Button onClick={resetCache}>테마 캐시 초기화</Button>
        <Button onClick={reloadThemes}>테마 캐시 로드</Button>
      </ButtonGroup>
      <DataTable
        keys={["uid", "name", "color"]}
        data={themeData}
      />
    </Panel>
  )
}

export default ThemesList;
