import Panel from "../elements/layout/panel.tsx";
import {H1, H2} from "../elements/typegraphy/Headers.tsx";
import {FormGroup, Label} from "../elements/form/General.tsx";
import {TextInput} from "../elements/form/Inputs.tsx";
import {useEffect, useState} from "react";
import {Button} from "../elements/form/Buttons.tsx";
import type {Theme, ThemeMapping} from "love/model/Theme.ts";
import ThemeTag from "../elements/theme/ThemeTag.tsx";
import {apiAuth} from "../../core/axios/withAxios.ts";
import issueNotification from "../../core/notification/NotificationCenter.ts";
import {check, rangeCheck, regexCheck, verifyAll} from "love/validation.ts";
import Caption from "../elements/typegraphy/Caption.tsx";
import {getThemeMapping} from "../../core/theme/theme.ts";
import {RequireRole} from "../elements/RoleTag.tsx";
import {Role} from "love/model/User.ts";

function ThemesSet() {
  const [uid, setUid] = useState<string>("");
  const [themeName, setThemeName] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [formState, setFormState] = useState<number>(0);
  const [themeCache, setThemeCache] = useState<ThemeMapping>({});

  useEffect(() => {
    getThemeMapping()
      .then(mapping => {
        setThemeCache(mapping);
        issueNotification(
          "테마 캐시",
          "테마 캐시를 불러왔습니다.",
          "success"
        )
      }).catch(err => {
      console.error(err);
      issueNotification(
        "테마 캐시",
        "테마 캐시를 로딩하지 못했습니다.\n테마 로드 기능이 동작하지 않을 수 있습니다.",
        "error"
      );
    });
  }, []);

  const theme: Theme = {
    name: themeName,
    color: color
  };

  function setTheme() {
    const uidInt = parseInt(uid);

    const validation = verifyAll(
      rangeCheck(uidInt, 0, 99),
      rangeCheck(themeName.length, 1, 32),
      rangeCheck(color.length, 6, 6),
      regexCheck(color, /^[0-9A-F]{6}$/)
    );

    if (validation !== 0) {
      issueNotification(
        "테마 오류",
        `테마 양식이 올바르지 않습니다: ${validation}`,
        "warning"
      )
      setFormState(validation);
      return;
    }

    apiAuth.post(
      "/recommendation/theme",
      {
        uid: uidInt,
        name: themeName,
        color: color
      }
    ).then(() => {
      issueNotification(
        "테마 설정",
        "테마를 설정했습니다.",
        "success");
    }).catch(err => {
      console.error(err);
      issueNotification(
        "테마 설정",
        "테마를 설정하지 못했습니다.",
        "error"
      );
    });
  }

  function loadTheme() {
    const uidInt = parseInt(uid);

    if (uidInt in themeCache) {
      const loadedTheme = themeCache[uidInt];
      setThemeName(loadedTheme.name);
      setColor(loadedTheme.color);
      issueNotification(
        "테마 로드",
        `${uidInt}번 테마 정보를 불러왔습니다.`,
        "success"
      );
    } else {
      issueNotification(
        "테마 로드",
        `${uid}번 테마가 캐시에 존재하지 않습니다.\n테마를 설정하면 추가됩니다.`,
        "info"
      )
    }
  }

  return (
    <Panel>
      <RequireRole role={[
        Role.THEME_EDIT
      ]}/>

      <H1>테마 설정</H1>
      <H2>테마 불러오기</H2>
      <FormGroup>
        <Label>테마 UID</Label>
        <TextInput
          value={uid}
          setter={setUid}
          placeholder={"테마 UID"}
        />
        <Button onClick={loadTheme}>로드</Button>
        <Caption>기존에 존재하는 테마의 UID를 입력하면 해당 테마의 정보를 불러옵니다.<br/>테마 캐시를 먼저 불러와야 합니다.</Caption>
      </FormGroup>

      <H2>테마 설정</H2>
      <FormGroup>
        <Label>테마 UID</Label>
        <TextInput
          value={uid}
          setter={setUid}
          placeholder={"테마 UID"}
          error={check(formState, 0)}
        />
      </FormGroup>
      <FormGroup>
        <Label>테마 이름</Label>
        <TextInput
          value={themeName}
          setter={setThemeName}
          placeholder={"테마 이름"}
          error={check(formState, 1)}
        />
      </FormGroup>
      <FormGroup>
        <Label>테마 색상</Label>
        <TextInput
          value={color}
          setter={setColor}
          placeholder={"테마 색상"}
          error={check(formState, 2) || check(formState, 3)}
        />
      </FormGroup>
      <p>가독성을 확인하세요.</p>
      <div className={"flex gap-2 mt-2 mb-4 p-4 bg-light"}>
        <ThemeTag theme={theme}/>
        <ThemeTag theme={theme} type={"outlined"}/>
      </div>
      <Button onClick={setTheme}>설정</Button>
    </Panel>
  );
}

export default ThemesSet;
