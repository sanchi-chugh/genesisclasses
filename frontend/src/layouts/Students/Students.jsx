import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";

import studentsRoutes from "../../routes/Students";

class Students extends Component {

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
          <Switch>
            {studentsRoutes.map((prop, key) => {
              return (
                <Route path={prop.path} exact component={prop.component} key={key} />
              );
            })}
          </Switch>
      </div>
    );
  }
}

export default Students;
