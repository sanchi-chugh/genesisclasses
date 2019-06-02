import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter, Route, Switch } from "react-router-dom";

import indexRoutes from "./routes/index.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/sass/light-bootstrap-dashboard.css?v=1.2.0";
import "./assets/css/pe-icon-7-stroke.css";
import "./assets/css/app.css";
import "./assets/css/demo.css";

document.addEventListener("DOMContentLoaded", function(event) {
      ReactDOM.render(
		  <BrowserRouter>
		    <Switch>
		      {indexRoutes.map((prop, key) => {
		        return <Route path={prop.path} component={prop.component} key={key} />;
		      })}
		    </Switch>
		  </BrowserRouter>,
		  document.getElementById("root")
		);
    });
