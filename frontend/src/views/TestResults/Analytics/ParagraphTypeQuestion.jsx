import React, { Component } from "react";
import { Glyphicon, FormGroup, Checkbox } from "react-bootstrap";
import renderHTML from 'react-render-html';
import Explanation from './Explanation';

class ParagraphTypeQuestion extends Component {

  constructor(props){
    super(props);
    this.state = {
      show:false
    }
  }

  handleHide(){
    this.setState({
      show: false
    })
  }

  render() {
    console.log(this.props)
    return (
        <div style={{width:'100%', height: '100%'}}>
          <Explanation 
              data={this.props.questionDetails.questions}
              onHide={this.handleHide.bind(this)}
              show={this.state.show}
              type={'passage'}
            />
          <div className="index-head-paragraph">
            <h4 style={{display: "inline"}}>Paragraph</h4>
            <h4 style={{display: "inline", float: "right"}} id="explain" onClick={()=>this.setState({show:true})}>View Explanation</h4>
          </div>
          <div className="paragraph-block">
            <div className="paragraph-left">
              {renderHTML(this.props.questionDetails.paragraph)}
            </div>
            <div className="question-right" ref={(ref) => this.props.setWindow(ref)}>
              {this.props.questionDetails.questions.map(questions=>{
                return(
                    <div ref={ ref => this.props.setRefs(ref, questions.id)}>
                      <div className="question">
                        <p>{renderHTML(questions.questionText)}</p>
                      </div>
                      <div className="question-marks">
                        <p>Marks +{questions.marksPositive}, -{questions.marksNegative}</p>
                        <Glyphicon
                          glyph={questions.userResult.status === 'correct' ? 'ok-circle' 
                            : questions.userResult.status === 'incorrect' ? 'remove-circle' : ''
                          }
                          style={{
                            cursor:'pointer',
                            color:questions.userResult.status === 'correct'? 
                              'rgba(49, 143, 9, 1)' : 'rgba(255, 0, 0, 1)',
                            fontSize:'18px'}}
                          />
                      </div>
                      <div className="option">
                        <FormGroup>
                           {questions.options.map(option=>{
                            return(
                                <Checkbox 
                                  name={questions.id} 
                                  value={option.id}
                                  checked={
                                  questions.userResult.userChoices.some(item=>{
                                      return item === option.id
                                    }) || questions.correctOptions.some(item=>{
                                      return item === option.id
                                    })
                                  } 
                                  bsClass="my-radio">
                                  {renderHTML(option.optionText)}
                                  <span className={"checkmark " + (questions.correctOptions.some(item=>{
                                                                    return item === option.id
                                                                  }) ? 'correct' : '')}>
                                  </span>
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
