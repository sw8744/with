import "../style/univ.css"
import Footer from "./outline/Footer.tsx";
import {BrowserRouter, type NavigateFunction, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import CoreLogin from "./auth/authentication/login/CoreLogin.tsx";
import SetJwt from "./auth/authentication/login/SetJwt.tsx";
import CoreProfile from "./profile/CoreProfile.tsx";
import RegionShowcase from "./location/RegionShowcase.tsx";
import PlaceShowcase from "./location/PlaceShowcase.tsx";
import CoreLocationIndex from "./location/LocationIndexPage/CoreLocationIndex.tsx";
import CorePlanner from "./planner/CorePlanner.tsx";
import LikedPlaces from "./profile/LikedPlaces.tsx";
import MyPlans from "./profile/MyPlans.tsx";
import CoreGoogleRegister from "./auth/signup/GoogleRegister/CoreGoogleRegister.tsx";
import CorePlan from "./plan/CorePlan.tsx";
import CoreEditProfile from "./profile/EditProfile/CoreEditProfile.tsx";
import {AnimatePresence} from "framer-motion";
import CoreMembers from "./plan/member/CoreMembers.tsx";
import CoreSchedule from "./plan/schedule/CoreSchedule.tsx";
import CoreFind from "./find/CoreFind.tsx";
import ShareProfile from "./profile/ShareProfile.tsx";
import {useEffect} from "react";

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

        <Route path={"/profile/edit"} element={<CoreEditProfile/>}/>
        <Route path={"/profile/share"} element={<ShareProfile/>}/>

        <Route
          path={"/profile"}
          element={<CoreProfile/>}
        >
          <Route path={""} element={<LikedPlaces/>}/>
          <Route path={"plans"} element={<MyPlans/>}/>
        </Route>

        <Route path={"/plan"}>
          <Route path={""} element={<CorePlanner/>}/>
          <Route path={":planUUID/*"} element={<CorePlan/>}>
            <Route path={""} element={<CoreSchedule/>}/>
            <Route path={"timeline"} element={<CoreSchedule/>}/>
            <Route path={'members'} element={<CoreMembers/>}/>
          </Route>
        </Route>

        <Route path={"/find"} element={<CoreFind/>}/>

        <Route
          path={"/register/google"}
          element={<CoreGoogleRegister/>}
        />

        <Route
          path={"/login"}
          element={<CoreLogin/>}
        />
        <Route
          path={"/login/set-token"}
          element={<SetJwt/>}
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
