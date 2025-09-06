import "../style/univ.css"
import Footer from "./outline/Footer.tsx";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Header from "./outline/Header.tsx";
import Locations from "./location/Locations.tsx";

function App() {
  return (
    <BrowserRouter>
      <Header/>
      <main
        style={{flex: 1}}
      >
        <Routes>
          <Route
            path={'/location'}
            element={<Locations/>}
          />
        </Routes>
      </main>
      <Footer/>
    </BrowserRouter>
  );
}

export default App
