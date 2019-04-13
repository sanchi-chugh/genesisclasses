import React, { Component } from "react";
import { Glyphicon, FormGroup, Checkbox } from "react-bootstrap";
import renderHTML from 'react-render-html';

class MCQTypeQuestion extends Component {

  render() {
    console.log(this.props)
    return (
        <div>
          <div className="index-head">
            <div className="left">
              <h4>Question : {this.props.questionDetails.quesNumber}</h4>
              <p>Multiple Choice Question</p>
            </div>
            <div className="right">
              <Glyphicon 
                glyph={this.props.reviewDetails.status === 'Correct' ? 'ok-sign' : 'remove-sign'
                } 
                style={{
                  cursor:'pointer',
                  color:this.props.reviewDetails.status === 'Correct'? 
                    'rgba(49, 143, 9, 1)' : 'rgba(255, 0, 0, 1)',
                  fontSize:'18px'}}
                />
              <p>Marks +{this.props.questionDetails.marksPositive}, -{this.props.questionDetails.marksNegative}</p>
            </div>
          </div>
          <div className="question">
            <p>{renderHTML(this.props.questionDetails.questionText)}</p>
          </div>
          <div className="option">
            <FormGroup>
              {this.props.questionDetails.options.map(option=>{
                return(
                    <Checkbox 
                      name={option.id} 
                      bsClass="my-checkbox"
                      checked={
                          this.props.questionDetails.userResult.userChoices.some(item=>{
                            return item === option.id
                          })
                        }>
                      {renderHTML(option.optionText)}
                      <span className="checkmark"></span>
                    </Checkbox>
                  )
                })}
            </FormGroup>
          </div>
        </div>
    );
  }
}

export default MCQTypeQuestion;
