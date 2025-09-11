import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './views/App.tsx'
import {Provider} from "react-redux";
import store from "./core/redux/RootReducer.ts";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App/>
    </Provider>
  </StrictMode>,
);
