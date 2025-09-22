import {useEffect, useState} from "react";
import {apiAuth} from "../../core/axios/withAxios.ts";
import type {userAPI} from "../../core/apiResponseInterfaces/user.ts";
import {Button} from "../elements/Buttons.tsx";
import {GearIcon} from "../../assets/svgs/svgs.ts";
import {isAxiosError} from "axios";

function CoreProfile() {
  const [name, setName] = useState('')

  useEffect(() => {
    apiAuth.get<userAPI>('/user')
      .then(res => {
        setName(res.data.user.name);
      }).catch(err => {
      if (isAxiosError(err)) {

      }
    });
  }, []);

  return (
    <div className={'flex flex-col gap-2 mx-5 my-2'}>
      <div className={'flex justify-between items-center'}>
        <p className={'text-xl font-bold'}>{name}님</p>
        <Button theme={'clear'}>
          <GearIcon/>
        </Button>
      </div>
    </div>
  );
}

export default CoreProfile;
