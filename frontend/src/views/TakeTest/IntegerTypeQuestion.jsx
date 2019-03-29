import React, { Component } from "react";
import { Glyphicon, FormGroup, Checkbox } from "react-bootstrap";
import renderHTML from 'react-render-html';

const integers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
class MCQTypeQuestion extends Component {

  render() {
    return (
        <div>
          <div className="index-head">
            <div className="left">
              <h4>Question : {this.props.data.quesNumber}</h4>
              <p>Integer Type Question</p>
            </div>
            <div className="right">
              <Glyphicon glyph="star"/>
              <p>Marks +{this.props.data.marksPositive}, -{this.props.data.marksNegative}</p>
            </div>
          </div>
          <div className="question">
            <p>{renderHTML(this.props.data.questionText)}</p>
          </div>
          <div className="option">
            <div className="integer-options">
              {integers.map(item=>{
                return(
                    <div className="integer-option-btn" key={item} onClick={this}>
                      {item}
                    </div>
                  )
              })}
            </div>
          </div>
        </div>
    );
  }
}

export default MCQTypeQuestion;
