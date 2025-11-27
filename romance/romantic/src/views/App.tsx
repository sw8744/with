import "../style/univ.css"
import Footer from "./outline/Footer.tsx";
import {BrowserRouter, type NavigateFunction, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import CoreLogin from "./auth/authentication/login/CoreLogin.tsx";
import SetJwt from "./auth/authentication/login/SetJwt.tsx";
import CoreProfile from "./profile/MyProfile/CoreProfile.tsx";
import RegionShowcase from "./location/RegionShowcase.tsx";
import PlaceShowcase from "./location/PlaceShowcase.tsx";
import CoreLocationIndex from "./location/LocationIndexPage/CoreLocationIndex.tsx";
import LikedPlaces from "./profile/MyProfile/LikedPlaces.tsx";
import MyPlans from "./profile/MyProfile/MyPlans.tsx";
import CoreGoogleRegister from "./auth/signup/GoogleRegister/CoreGoogleRegister.tsx";
import CoreEditProfile from "./profile/Settings/account/CoreEditProfile.tsx";
import {AnimatePresence} from "framer-motion";
import CoreFind from "./find/CoreFind.tsx";
import ShareProfile from "./profile/MyProfile/ShareProfile.tsx";
import {useEffect} from "react";
import Logout from "./auth/authentication/login/Logout.tsx";
import LoginOptions from "./auth/authentication/login/LoginOptions.tsx";
import CoreSettings from "./profile/Settings/CoreSettings.tsx";
import CoreAuthenticationSettings from "./profile/Settings/authentication/CoreAuthenticationSettings.tsx";
import CoreUser from "./profile/OtherProfile/CoreUser.tsx";

let navigator: NavigateFunction;

function App() {
  return (
    <BrowserRouter>
      <main className={"w-full mx-auto sm:w-3/4 md:w-1/2 xl:w-[35%] pb-[65px] overflow-x-clip relative"}>
        <AnimatedRouter/>
      </main>
      <Footer/>
    </BrowserRouter>
  );
}

function AnimatedRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    navigator = navigate;
  }, [navigate])

  return (
    <AnimatePresence mode="popLayout">
      <Routes location={location} key={location.pathname}>
        <Route path={"/location"}>
          <Route path={""} element={<CoreLocationIndex/>}/>
          <Route path={"region/:regionUID"} element={<RegionShowcase/>}/>
          <Route path={"place/:placeUID"} element={<PlaceShowcase/>}/>
        </Route>

        <Route path={"/settings"} element={<CoreSettings/>}/>
        <Route path={"/settings/account"} element={<CoreEditProfile/>}/>
        <Route path={"/settings/auth"} element={<CoreAuthenticationSettings/>}/>

        <Route path={"/profile/share"} element={<ShareProfile/>}/>

        <Route
          path={"/profile"}
          element={<CoreProfile/>}
        >
          <Route path={""} element={<LikedPlaces/>}/>
          <Route path={"plans"} element={<MyPlans/>}/>
        </Route>

        <Route path={"/user/:userUUID"} element={<CoreUser/>}/>

        <Route path={"/find"} element={<CoreFind/>}/>

        <Route
          path={"/register/google"}
          element={<CoreGoogleRegister/>}
        />

        <Route
          path={"/login"}
          element={<CoreLogin/>}
        >
          <Route path={""} element={<LoginOptions/>}/>
        </Route>
        <Route
          path={"/login/set-token"}
          element={<SetJwt/>}
        />
        <Route
          path={"/logout"}
          element={<Logout/>}
        />

        <Route
          path={"/blank"}
          element={<></>}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App
export {
  navigator
}
