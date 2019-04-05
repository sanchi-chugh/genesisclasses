import React, { Component } from "react";
import { Glyphicon } from "react-bootstrap";
import renderHTML from 'react-render-html';

class Instructions extends Component {

  render() {
    return (
        <div className="test-instructions">
          <div className="upper-section">
            <div className="left">
              <div className="instruction">
                <div className="content"><strong>Category:</strong> Unit Wise Test</div>
                {this.props.data.subject && <div className="content"><strong>Subject:</strong> {this.props.data.subject.title}</div>}
                <div className="content"><strong>Course:</strong> {this.props.data.course.join(', ')}</div>
                {this.props.data.unit && <div className="content"><strong>Unit:</strong> {this.props.data.unit.title}</div>}
              </div>
              <div>
                <div className="instruction-card" id="color1">
                  <div className="content">
                    <h4>Total Questions</h4>
                    <h3>{this.props.data.totalQuestions}</h3>
                  </div>
                </div>
                <div className="instruction-card" id="color2">
                  <div className="content">
                    <h4>Total Marks</h4>
                    <h3>{this.props.data.totalMarks}</h3>
                  </div>
                </div>
                <div className="instruction-card" id="color3" style={{marginRight:'0px'}}>
                  <div className="content">
                    <h4>Duration (Mins)</h4>
                    <h3>{parseInt(this.props.data.duration.split(':')[0])*60 + parseInt(this.props.data.duration.split(':')[1])}</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="right">
              <div className="description">
                <h4>Description</h4>
                <p>
                  {this.props.data.description === null ? '...' : this.props.data.description}
                </p>
              </div>
            </div>
          </div>
          <div className="lower-section">
            <div className="description">
              <h4>Instructions</h4>
              <p>
                {renderHTML(this.props.data.instructions)}
              </p>
            </div>
          </div>
          <div className="footer">
            <p onClick={this.props.startTest}>START TEST</p>
          </div>
      </div>
    );
  }
}

export default Instructions;
