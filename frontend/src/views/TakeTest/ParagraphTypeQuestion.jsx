import React, { Component } from "react";
import { Glyphicon, FormGroup, Checkbox } from "react-bootstrap";
import renderHTML from 'react-render-html';

class ParagraphTypeQuestion extends Component {

  render() {
    console.log(this.props)
    return (
        <div style={{width:'100%', height: '100%'}}>
          <div className="index-head-paragraph">
            <h4>Paragraph</h4>
          </div>
          <div className="paragraph-block">
            <div className="paragraph-left">
              {renderHTML(this.props.paragraph)}
            </div>
            <div className="question-right">
              {this.props.data.map(questions=>{
                return(
                    <div>
                      <div className="question">
                        <p>{renderHTML(questions.questionText)}</p>
                      </div>
                      <div className="question-marks">
                        <p>Marks +{questions.marksPositive}, -{questions.marksNegative}</p>
                        <Glyphicon glyph="star"/>
                      </div>
                      <div className="option">
                        <FormGroup>
                           {questions.options.map(option=>{
                            return(
                                <Checkbox 
                                  name={questions.id} 
                                  value={option.id} 
                                  bsClass="my-radio"
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
                                  }>
                                  {renderHTML(option.optionText)}
                                  <span className="checkmark"></span>
                                </Checkbox>
                              )
                           })}
                        </FormGroup>
                      </div>
                    </div>
                  )
              })}
            </div>
          </div>
        </div>
    );
  }
}

export default ParagraphTypeQuestion;
