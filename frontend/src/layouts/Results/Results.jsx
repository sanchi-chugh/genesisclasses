import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import resultsRoutes from "../../routes/results";

class ResultsLayout extends Component {

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
            {resultsRoutes.map((prop, key) => {
              if (prop.redirect)
                return <Redirect from={prop.path} to={prop.to} key={key} />;
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

export default ResultsLayout;
