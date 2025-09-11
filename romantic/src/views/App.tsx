import "../style/univ.css"
import Footer from "./outline/Footer.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Header from "./outline/Header.tsx";
import Regions from "./location/Regions.tsx";
import CoreLogin from "./profile/authentication/login/CoreLogin.tsx";
import GoogleRegister from "./profile/signup/GoogleRegister.tsx";
import SetJwt from "./profile/authentication/login/SetJwt.tsx";

function App() {
  return (
    <BrowserRouter>
      <Header/>
      <main className={'w-full sm:w-3/4 md:w-1/2 mx-auto mb-[64.74px]'}>
        <Routes>
          <Route
            path={'/location'}
            element={<Regions/>}
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
