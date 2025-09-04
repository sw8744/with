import "../style/univ.css"
import Footer from "./outline/Footer.tsx";
import {BrowserRouter, Routes} from "react-router-dom";
import Header from "./outline/Header.tsx";

function App() {
  return (
    <BrowserRouter>
      <Header/>
      <main style={{flex: 1}}>
        <Routes>

        </Routes>
      </main>
      <Footer/>
    </BrowserRouter>
  );
}

export default App
