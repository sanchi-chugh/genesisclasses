import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import testsRoutes from "../../routes/Tests";

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
            {testsRoutes.map((prop, key) => {
              return (
                <Route path={prop.path} exact render={routeProps => (
                  <prop.component
                    {...routeProps}
                    handleClick={this.props.handleClick}
                  />
                )} key={key} />
              );
            })}
          </Switch>
      </div>
    );
  }
}

export default Students;
