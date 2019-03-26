import React, { Component } from "react";
import NotificationSystem from "react-notification-system";
import { Route, Switch, Redirect } from "react-router-dom";
import { Glyphicon } from "react-bootstrap";
import TakeTest from "../../views/TakeTest/TakeTest";
import Instructions from "../../views/TakeTest/Instructions";
import axios from 'axios';
import { toggleFullScreen }  from "../../utils.jsx";
import { style } from "../../variables/Variables.jsx";

import '../../assets/css/app.css';

class TakeTestLayout extends Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.state = {
      _notificationSystem: null,
      expanded:false,
      busy:true,
      data:null,
      flag:false
    };
  }

  componentDidMount() {
    toggleFullScreen();
    this.fetchTestDetails();
    this.setState({ _notificationSystem: this.refs.notificationSystem });
    var _notificationSystem = this.refs.notificationSystem;
  }

  fetchTestDetails(){
    axios.get("/api/app/tests/5/detail/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        },
        onDownloadProgress: progressEvent => {
        let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
        // do whatever you like with the percentage complete
        // maybe dispatch an action that will update a progress bar or something
        console.log(percentCompleted)
      }
    }).then(res => {
        console.log(res.data)
        const data = res.data.detail
        this.setState({data:data, busy:false});
    });
  }

  handleBack(){
    this.setState({flag:false});
    toggleFullScreen();
    this.props.history.goBack();
  }

  startTest(){
    this.setState({
      flag:true
    })
  }

  render() {
    if(this.state.busy)
      return(
          <div className="loader"></div>
        )
    return (
      <div className="wrapper" id="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <div id="main-panel" className="wrapper-test main-panel-expanded" ref="mainPanel">
          <div className="header">
            <div className="content">
              <a onClick={this.handleBack.bind(this)}><Glyphicon glyph="chevron-left" style={{display: 'inline-block', float:'left', color: '#01458E',fontSize: '18px'}}/></a>
              <h3>TEST TITLE</h3>
            </div>
          </div>
          {
            this.state.flag ?
            <TakeTest /> :
            <Instructions 
              data={this.state.data}
              startTest={this.startTest.bind(this)}
            />
          }
        </div>
      </div>
    );
  }
}

export default TakeTestLayout;
