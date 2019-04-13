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
              <h4>Question : {this.props.questionDetails.quesNumber}</h4>
              <p>Integer Type Question</p>
            </div>
            <div className="right">
              <Glyphicon 
                glyph={true ? 'star' : 'star-empty'
                } 
                style={{cursor:'pointer',color:'rgba(210, 237, 255, 1)',fontSize:'18px'}}
                onClick={()=>this.props.handleReview(this.props.questionDetails.id)}
                />
              <p>Marks +{this.props.questionDetails.marksPositive}, -{this.props.questionDetails.marksNegative}</p>
            </div>
          </div>
          <div className="question">
            <p>{renderHTML(this.props.questionDetails.questionText)}</p>
          </div>
          <div className="option">
            <div className="integer-options">
              {integers.map(int=>{
                return(
                    <div 
                      className={false ? "integer-option-btn int-selected" : "integer-option-btn"} 
                      key={int}
                      onClick={
                        (e) => 
                          this.props.handleResponse(
                            e,
                            this.props.questionDetails.id, 
                            int,
                            this.props.questionDetails.questionType
                          )
                      }>
                      {int}
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
