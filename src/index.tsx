import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Route, Switch } from "react-router-dom";
import App from "./components/App";
import NotFound from "./components/NotFound";

ReactDOM.render(
  <BrowserRouter basename={process.env.REACT_APP_BASE_PATH}>
    <Switch>
      <Route path="/" exact component={App} />
      <Route component={NotFound} />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
