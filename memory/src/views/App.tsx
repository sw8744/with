import "../style/univ.css"
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Header from "./elements/layout/Header.tsx";
import Hierarchy from "./elements/Hierarchy.tsx";
import AuthLogin from "./auth/login/AuthLogin.tsx";
import ErrorPage from "./ErrorPage.tsx";
import NotificationCenter from "./elements/layout/NotificationCenter.tsx";

function App() {
  return (
    <BrowserRouter>
      <Header/>
      <main className={"w-full min-h-screen grid grid-cols-[200px_1fr]"}>
        <div className={"flex flex-col gap-1.5 border-r border-neutral-600 p-4"}>
          <Hierarchy text={"홈"} to={"/"}/>
          <Hierarchy text={"인증센터"}>
            <Hierarchy text={"로그인"} to={"/auth/login"}/>
            <Hierarchy text={"Refresh"} to={"/auth/refresh"}/>
            <Hierarchy text={"토큰 검증"} to={"/auth/access-token"}/>
          </Hierarchy>
          <Hierarchy text={"지역"}>
            <Hierarchy text={"지역 목록"} to={"/regions"}/>
            <Hierarchy text={"지역 추가"} to={"/regions/create"}/>
          </Hierarchy>
          <Hierarchy text={"장소"}>
            <Hierarchy text={"장소 목록"} to={"/places"}/>
            <Hierarchy text={"장소 추가"} to={"/places/create"}/>
          </Hierarchy>
          <Hierarchy text={"테마"}>
            <Hierarchy text={"테마 목록"} to={"/themes"}/>
          </Hierarchy>
        </div>

        <NotificationCenter/>

        <Routes>
          <Route path={"/auth"}>
            <Route path={"login"} element={<AuthLogin/>}/>
          </Route>

          <Route path={"*"} element={<ErrorPage code={404} message={"Not Found"}/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
