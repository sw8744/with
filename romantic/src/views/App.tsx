import "../style/univ.css"
import Footer from "./outline/Footer.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Header from "./outline/Header.tsx";
import Regions from "./location/Regions.tsx";

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
            element={<Regions/>}
          />
        </Routes>
      </main>
      <Footer/>
    </BrowserRouter>
  );
}

export default App
