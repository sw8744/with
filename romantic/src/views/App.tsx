import "../style/univ.css"
import Footer from "./outline/Footer.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Header from "./outline/Header.tsx";
import CoreLocation from "./location/CoreLocation.tsx";
import CoreLogin from "./auth/authentication/login/CoreLogin.tsx";
import GoogleRegister from "./auth/signup/GoogleRegister.tsx";
import SetJwt from "./auth/authentication/login/SetJwt.tsx";
import CoreProfile from "./profile/CoreProfile.tsx";
import RegionShowcase from "./location/RegionShowcase.tsx";
import PlaceShowcase from "./location/LocationShowcase.tsx";

function App() {
  return (
    <BrowserRouter>
      <Header/>
      <main className={'w-full sm:w-3/4 md:w-1/2 mx-auto mb-[64.74px]'}>
        <Routes>
          <Route path={'/location'} element={<CoreLocation/>}>
            <Route path={'region/:regionUID'} element={<RegionShowcase/>}/>
            <Route path={'place/:placeUID'} element={<PlaceShowcase/>}/>
          </Route>

          <Route
            path={'/profile'}
            element={<CoreProfile/>}
          />

          <Route
            path={'/register/google'}
            element={<GoogleRegister/>}
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
