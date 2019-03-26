import React, { Component } from "react";
import { Glyphicon, Button } from "react-bootstrap";
import Timer from "react-compound-timer";
import { toggleFullScreen }  from "../../utils.jsx";
import axios from 'axios';

class Instructions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded:false,
      data: null,
      busy:true
    };
  }

  componentDidMount(){
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

  toggle(){
    console.log(this.state.expanded)
    this.setState({
      expanded: !this.state.expanded
    })
  }

  render() {
    if(this.state.busy)
      return(
          <div className="loader"></div>
        )
    return (
        <div className="test-instructions">
          <div className="upper-section">
            <div className="left">
              <div className="instruction">
                <div className="content"><strong>Category:</strong> Unit Wise Test</div>
                <div className="content"><strong>Subject:</strong> Chemistry</div>
                <div className="content"><strong>Course:</strong> {this.state.data.course.join(', ')}</div>
                <div className="content"><strong>Unit:</strong> Chemical Engeneering</div>
              </div>
              <div>
                <div className="instruction-card" id="color1">
                  <div className="content">
                    <h4>Total Questions</h4>
                    <h3>{this.state.data.totalQuestions}</h3>
                  </div>
                </div>
                <div className="instruction-card" id="color2">
                  <div className="content">
                    <h4>Total Marks</h4>
                    <h3>{this.state.data.totalMarks}</h3>
                  </div>
                </div>
                <div className="instruction-card" id="color3" style={{marginRight:'0px'}}>
                  <div className="content">
                    <h4>Duration (Mins)</h4>
                    <h3>{parseInt(this.state.data.duration.split(':')[0])*60 + parseInt(this.state.data.duration.split(':')[1])}</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="right">
              <div className="description">
                <h4>Description</h4>
                <p>
                  {this.state.data.description === null ? '...' : this.state.data.description}
                </p>
              </div>
            </div>
          </div>
          <div className="lower-section">
            <div className="description">
              <h4>Instructions</h4>
              <p>
                lorem ipsum hehe
              </p>
            </div>
          </div>
          <div className="footer">
            <p>START TEST</p>
          </div>
      </div>
    );
  }
}

export default Instructions;
