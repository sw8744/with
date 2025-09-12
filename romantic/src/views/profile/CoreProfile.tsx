import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {useEffect, useState} from "react";
import {apiAuth} from "../../core/axios/withAxios.ts";
import type {userAPI} from "../../core/apiResponseInterfaces/user.ts";

function CoreProfile() {
  const [name, setName] = useState('')

  useEffect(() => {
    apiAuth.get<userAPI>('/user')
      .then(res => {
        setName(res.data.user.name);
      }).catch(err => {

    })
  }, []);

  return (
    <>
      {name}
    </>
  );
}

export default CoreProfile;
