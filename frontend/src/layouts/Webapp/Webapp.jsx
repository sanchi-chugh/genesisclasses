import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import NotificationSystem from "react-notification-system";

import Header from "../../WebAppComponents/Header/Header";
import Footer from "../../components/Footer/Footer";
import Sidebar from "../../WebAppComponents/Sidebar/Sidebar";

import { style } from "../../variables/Variables.jsx";

import webapppRoutes from "../../routes/Webapp";

import '../../assets/css/app.css';

class Webapp extends Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleNotificationClick = this.handleNotificationClick.bind(this);
    this.state = {
      _notificationSystem: null
    };
  }
  handleNotificationClick(position,text,level="success") {
    this.state._notificationSystem.addNotification({
      message: (
        <div>{text}</div>
      ),
      level: level,
      position: position,
      autoDismiss: 15
    });
  }
  componentDidMount() {
    this.setState({ _notificationSystem: this.refs.notificationSystem });
    var _notificationSystem = this.refs.notificationSystem;
  }
  componentDidUpdate(e) {
    if (
      window.innerWidth < 993 &&
      e.history.location.pathname !== e.location.pathname &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
    }
    if (e.history.action === "PUSH") {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainPanel.scrollTop = 0;
    }
  }
  render() {
    return (
      <div className="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <Sidebar {...this.props} />
        <div id="main-panel" className="main-panel" ref="mainPanel">
          <Header {...this.props} />
          <Switch>
            {webapppRoutes.map((prop, key) => {
              if (prop.name === "Notifications")
                return (
                  <Route
                    path={prop.path}
                    key={key}
                    render={routeProps => (
                      <prop.component
                        {...routeProps}
                        handleClick={this.handleNotificationClick}
                      />
                    )}
                  />
                );
              if (prop.redirect)
                return <Redirect from={prop.path} to={prop.to} key={key} />;
              return (
                <Route path={prop.path} render={routeProps => (
                  <prop.component
                    {...routeProps}
                    handleClick={this.handleNotificationClick}
                  />
                )} key={key} />
              );
            })}
          </Switch>
          <Footer />
        </div>
      </div>
    );
  }
}

export default Webapp;
