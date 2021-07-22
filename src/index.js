import React from "react";
import ReactDOM from "react-dom";
// import "./index.css";
import { ResetStyle, GlobalStyle } from "./global/globalStyle.js";
import App from "./WeatherApp";

ReactDOM.render(
  <React.StrictMode>
    <ResetStyle />
    <GlobalStyle />
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
