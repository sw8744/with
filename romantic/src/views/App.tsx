import "../style/univ.css"
import Footer from "./outline/Footer.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import CoreLocation from "./location/CoreLocation.tsx";
import CoreLogin from "./auth/authentication/login/CoreLogin.tsx";
import SetJwt from "./auth/authentication/login/SetJwt.tsx";
import CoreProfile from "./profile/CoreProfile.tsx";
import RegionShowcase from "./location/RegionShowcase.tsx";
import PlaceShowcase from "./location/PlaceShowcase.tsx";
import Locations from "./location/Locations.tsx";
import CorePlan from "./plan/CorePlan.tsx";
import LikedPlaces from "./profile/LikedPlaces.tsx";
import MyPosts from "./profile/MyPosts.tsx";
import MyTrips from "./profile/MyTrips.tsx";
import CoreGoogleRegister from "./auth/signup/GoogleRegister/CoreGoogleRegister.tsx";

function App() {
  return (
    <BrowserRouter>
      <main className={'w-full sm:w-3/4 md:w-1/2 xl:w-[35%] mx-auto mb-[64.74px]'}>
        <Routes>
          <Route path={'/location'} element={<CoreLocation/>}>
            <Route path={''} element={<Locations/>}/>
            <Route path={'region/:regionUID'} element={<RegionShowcase/>}/>
            <Route path={'place/:placeUID'} element={<PlaceShowcase/>}/>
          </Route>

          <Route
            path={'/profile'}
            element={<CoreProfile/>}
          >
            <Route path={''} element={<MyPosts/>}/>
            <Route path={'liked'} element={<LikedPlaces/>}/>
            <Route path={'trips'} element={<MyTrips/>}/>
          </Route>

          <Route path={'/plan'}>
            <Route path={''} element={<CorePlan/>}/>
          </Route>

          <Route
            path={'/register/google'}
            element={<CoreGoogleRegister/>}
          />

          <Route
            path={'/login'}
            element={<CoreLogin/>}
          />
          <Route
            path={'/login/set-token'}
            element={<SetJwt/>}
          />
        </Routes>
      </main>
      <Footer/>
    </BrowserRouter>
  );
}

export default App
