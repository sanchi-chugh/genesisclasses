import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import NotificationSystem from "react-notification-system";
import EditProfile from "../../views/EditProfile/EditProfile";

import Header from "../../WebAppComponents/Header/Header";

import { style } from "../../variables/Variables.jsx";

import '../../assets/css/app.css';

class Webapp extends Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleNotificationClick = this.handleNotificationClick.bind(this);
    this.state = {
      _notificationSystem: null,
      expanded:true
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
      <div className="wrapper" id="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <div id="main-panel" className={"main-panel" + (this.state.expanded ? " main-panel-expanded" : "")} ref="mainPanel">
          <Header {...this.props} expanded={this.state.expanded} flag={true}/>
          <Switch>
            <Route path={'/completeDetails'} render={
                (props) => <EditProfile
                             {...props} 
                             flag={true}
                             user={this.props.user} 
                             logout={this.props.logout}
                             getUser={this.props.getUser}
                             completeProfile={this.props.completeProfile}
                             handleClick={this.handleNotificationClick} />  } />
            <Redirect from={'/'} to={'/completeDetails'} />;
          </Switch>
        </div>
      </div>
    );
  }
}

export default Webapp;
