import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import resultsRoutes from "../../routes/results";

class ResultsLayout extends Component {

  render() {
    return (
      <div className="content" ref={'content'}>
          <Switch>
            {resultsRoutes.map((prop, key) => {
              if (prop.redirect)
                return <Redirect from={prop.path} to={prop.to} key={key} />;
              return (
                <Route path={prop.path} exact render={routeProps => (
                  <prop.component
                    {...routeProps}
                    handleClick={this.props.handleClick}
                    logout={this.props.logout}
                  />
                )} key={key} />
              );
            })}
          </Switch>
      </div>
    );
  }
}

export default ResultsLayout;
