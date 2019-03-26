import React, { Component } from "react";
import NotificationSystem from "react-notification-system";
import { Route, Switch, Redirect } from "react-router-dom";
import { Glyphicon } from "react-bootstrap";
import TakeTest from "../../views/TakeTest/TakeTest";
import { style } from "../../variables/Variables.jsx";
import takeTestRoutes from "../../routes/TakeTest";
import '../../assets/css/app.css';

class TakeTestLayout extends Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.state = {
      _notificationSystem: null,
      expanded:false
    };
  }

  componentDidMount() {
    this.setState({ _notificationSystem: this.refs.notificationSystem });
    var _notificationSystem = this.refs.notificationSystem;
  }

  render() {
    return (
      <div className="wrapper" id="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <div id="main-panel" className="wrapper-test main-panel-expanded" ref="mainPanel">
          <div className="header">
            <div className="content">
              <a><Glyphicon glyph="chevron-left" style={{display: 'inline-block', float:'left', color: '#01458E',fontSize: '18px'}}/></a>
              <h3>TEST TITLE</h3>
            </div>
          </div>
          <Switch>
            {takeTestRoutes.map((prop, key) => {
              if (prop.redirect)
                return <Redirect from={prop.path} to={prop.to} key={key} />;
              return (
                <Route path={prop.path} render={routeProps => (
                  <prop.component
                    {...routeProps}
                    handleClick={this.handleNotificationClick}
                    expanded={this.state.expanded}
                  />
                )} key={key} />
              );
            })}
          </Switch>
        </div>
      </div>
    );
  }
}

export default TakeTestLayout;
