import React, { Component } from "react";
import { Glyphicon, FormGroup, Checkbox } from "react-bootstrap";
import renderHTML from 'react-render-html';

class SCQTypeQuestion extends Component {

  render() {
    return (
        <div>
          <div className="index-head">
            <div className="left">
              <h4>Question : {this.props.questionDetails.quesNumber}</h4>
              <p>Single choice question</p>
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
            <FormGroup>
              {this.props.questionDetails.options.map(option=>{
                  return(
                      <Checkbox 
                        name={this.props.questionDetails.id} 
                        value={option.id} 
                        bsClass="my-radio"
                        checked={false}
                        onChange={(e)=>this.props.handleResponse(e,this.props.questionDetails.id, option.id, this.props.questionDetails.questionType)}>
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

export default SCQTypeQuestion;
