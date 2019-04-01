import React, { Component } from "react";
import { Glyphicon, FormGroup, Checkbox } from "react-bootstrap";
import renderHTML from 'react-render-html';

class MCQTypeQuestion extends Component {

  render() {
    return (
        <div>
          <div className="index-head">
            <div className="left">
              <h4>Question : {this.props.data.quesNumber}</h4>
              <p>Multiple Choice Question</p>
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
            <FormGroup>
              {this.props.data.options.map(option=>{
                return(
                    <Checkbox 
                      name={option.id} 
                      bsClass="my-checkbox"
                      checked={this.props.ans.some(item=>{
                        return item.option === option.id
                      })}
                      onChange={
                        (e) => 
                          this.props.handleResponse(
                            e,
                            this.props.data.id, 
                            option.id, 
                            this.props.data.questionType
                          )
                        }
                      >
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
