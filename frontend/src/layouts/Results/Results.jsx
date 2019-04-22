import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import homeRoutes from "../../routes/Home";

class HomeLayout extends Component {

  componentDidUpdate(e) {
    if (e.history.action === "PUSH") {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.content.scrollTop = 0;
    }
  }

  render() {
    return (
      <div className="content" ref={'content'}>
          test
      </div>
    );
  }
}

export default HomeLayout;
