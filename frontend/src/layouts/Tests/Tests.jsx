import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import testsRoutes from "../../routes/Tests";

class Students extends Component {

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
