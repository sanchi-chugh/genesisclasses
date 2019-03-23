import React, { Component } from "react";
import NotificationSystem from "react-notification-system";
import { Glyphicon } from "react-bootstrap";

import { style } from "../../variables/Variables.jsx";

import '../../assets/css/app.css';

class TakeTest extends Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.state = {
      _notificationSystem: null,
      expanded:true
    };
  }

  componentDidMount() {
    this.setState({ _notificationSystem: this.refs.notificationSystem });
    var _notificationSystem = this.refs.notificationSystem;
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
        <div id="main-panel" className="wrapper-test main-panel-expanded" ref="mainPanel">
          <div className="header">
            <div className="content">
              <a><Glyphicon glyph="chevron-left" style={{display: 'inline-block', float:'left', color: '#01458E',fontSize: '18px'}}/></a>
              <h3>TEST TITLE</h3>
            </div>
          </div>
          <div className="main-body">
            <div className="nav-right">
              <div className="content">
              </div>
            </div>
            <div className="body">
              <div className="content">
              </div>

            </div>

            <div className="footer">

              </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TakeTest;

// <Switch>
//   {webapppRoutes.map((prop, key) => {
//     if (prop.redirect)
//       return <Redirect from={prop.path} to={prop.to} key={key} />;
//     return (
//       <Route path={prop.path} render={routeProps => (
//         <prop.component
//           {...routeProps}
//           handleClick={this.handleNotificationClick}
//           expanded={this.state.expanded}
//         />
//       )} key={key} />
//     );
//   })}
// </Switch>