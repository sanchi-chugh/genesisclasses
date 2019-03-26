import React, { Component } from "react";
import { Glyphicon } from "react-bootstrap";
import Timer from "react-compound-timer";
import { toggleFullScreen }  from "../../utils.jsx";

class Instructions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded:false
    };
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
                <div className={"section-header " + (this.state.expanded ? "header-expanded": '')} onClick={this.toggle.bind(this)}>
                  <h5>Section : Part A</h5>
                  <Glyphicon glyph="menu-down" className={"icon "+ (this.state.expanded ? "icon-expanded" : '')}/>
                </div>
                <div className={"section-body " + (this.state.expanded ? "body-expanded": '')}>
                  <a>
                    <div className="question-badge" id="type1"><span style={{margin: 'auto', padding: '4px'}}>12</span></div>
                  </a>
                  <a>
                    <div className="question-badge" id="type1"><span style={{margin: 'auto', padding: '8px'}}>2</span></div>
                  </a>
                </div>
              </div>
              {
                //dummy section delete this after completing
              }
              <div className="section">
                <div className="section-header" onClick={this.toggle.bind(this)}>
                  <h5>Section : Part A</h5>
                  <Glyphicon glyph="menu-down" className={"icon "}/>
                </div>
              </div>

              <div className="button">
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
    );
  }
}

export default Instructions;
