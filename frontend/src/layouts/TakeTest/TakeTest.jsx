import React, { Component } from "react";
import NotificationSystem from "react-notification-system";
import { Glyphicon } from "react-bootstrap";
import Timer from "react-compound-timer";
import { style } from "../../variables/Variables.jsx";

import '../../assets/css/app.css';

class TakeTest extends Component {
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

  toggle(){
    console.log(this.state.expanded)
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
                <div className="timer">
                  <Timer initialTime={2*60*60*1000} direction="backward" formatValue={(value) => `${(value < 10 ? `0${value}` : value)} `}>
                      {() => (
                          <React.Fragment>
                              <Timer.Hours />{' : '} 
                              <Timer.Minutes />{' : '} 
                              <Timer.Seconds />
                          </React.Fragment>
                      )}
                  </Timer>
                </div>
                <div className="timer-units">
                  <ul>
                    <li>HOURS</li>
                    <li>MINS</li>
                    <li>SECS</li>
                  </ul>
                </div>
                <div className="labels">
                    <div><div className="disc" style={{backgroundColor:'#01458E'}}></div><div className="inline-labels">Unattempted <span style={{fontSize:'16px'}}> 72 </span></div></div>
                    <div><div className="disc" style={{backgroundColor:'#01458E'}}></div><div className="inline-labels">Marked For Review <span style={{fontSize:'16px'}}> 14 </span></div></div>
                    <div><div className="disc" style={{backgroundColor:'#01458E'}}></div><div className="inline-labels">Attempted <span style={{fontSize:'16px'}}> 2 </span></div></div>
                </div>
                {
                  // TODO: this section div will be render accorging to the sections in 
                  //the test using a loop and change the expanded variable to object
                }
                <div className="section">
                  <div className="section-header" onClick={this.toggle.bind(this)}>
                    <h5>Section : Part A</h5>
                    <Glyphicon glyph="menu-down" className={"icon "+ (this.state.expanded ? "icon-expanded" : '')}/>
                  </div>
                  <div className={"section-body " + (this.state.expanded ? "body-expanded": '')}>
                  </div>
                </div>
                <div className="section">
                  <div className="section-header" onClick={this.toggle.bind(this)}>
                    <h5>Section : Part A</h5>
                    <Glyphicon glyph="menu-down" className={"icon "+ (this.state.expanded ? "icon-expanded" : '')}/>
                  </div>
                </div>
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