import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './views/App.tsx'
import store from "./core/redux/RootReducer.ts";
import {Provider} from "react-redux";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App/>
    </Provider>
  </StrictMode>,
)
