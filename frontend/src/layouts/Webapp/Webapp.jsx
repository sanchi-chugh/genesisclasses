import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import NotificationSystem from "react-notification-system";

import Header from "../../WebAppComponents/Header/Header";
import Sidebar from "../../WebAppComponents/Sidebar/Sidebar";

import { style } from "../../variables/Variables.jsx";

import webapppRoutes from "../../routes/Webapp";

class Webapp extends Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleNotificationClick = this.handleNotificationClick.bind(this);
    this.state = {
      _notificationSystem: null,
      expanded:false
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
  toggleSidebar(){
    this.setState({
      expanded: !this.state.expanded
    })
  }
  render() {
    return (
      <div className="wrapper" id="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <Sidebar {...this.props} expanded={this.state.expanded}/>
        <div id="main-panel" className={"main-panel" + (this.state.expanded ? " main-panel-expanded" : "")} ref="mainPanel">
          <Header {...this.props} toggle={this.toggleSidebar.bind(this)} flag={false} expanded={this.state.expanded}/>
          <Switch>
            {webapppRoutes.map((prop, key) => {
              if (prop.redirect)
                return <Redirect from={prop.path} to={prop.to} key={key} />;
              return (
                <Route path={prop.path} render={routeProps => (
                  <prop.component
                    {...routeProps}
                    user={this.props.user}
                    getUser={this.props.getUser} 
                    handleClick={this.handleNotificationClick}
                    expanded={this.state.expanded}
                    logout={this.props.logout}
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

export default Webapp;
