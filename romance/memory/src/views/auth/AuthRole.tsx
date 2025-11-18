import {Role} from "love/model/User.ts";
import Panel from "../elements/layout/panel.tsx";
import {RequireRole} from "../elements/RoleTag.tsx";
import {FormGroup, Label} from "../elements/form/General.tsx";
import {Checkbox, TextInput} from "../elements/form/Inputs.tsx";
import {Button} from "../elements/form/Buttons.tsx";
import {useState} from "react";
import {check} from "love/validation.ts";

function AuthRole() {
  const [userId, setUserId] = useState<string>("");

  const [role, setRole] = useState<number>(0);

  function toggleRole(bit: number) {
    if (check(role, bit)) setRole(role - (1 << bit));
    else setRole(role + (1 << bit));
  }

  return (
    <Panel>
      <RequireRole role={[Role.ROOT]}/>

      <FormGroup>
        <Label>사용자 UID</Label>
        <TextInput
          value={userId}
          setter={setUserId}
          placeholder={"사용자 UID"}
        />
        <Button>로드 [NOT IMPL]</Button>
      </FormGroup>

      <div className={"my-2 grid grid-cols-[auto_auto] gap-x-3 w-fit"}>
        <p>CORE:USER</p>
        <Checkbox
          checked={check(role, 0)}
          setter={() => toggleRole(0)}
        />
      </div>

      <Button>설정 [NOT IMPL]</Button>
    </Panel>
  );
}

export default AuthRole;
