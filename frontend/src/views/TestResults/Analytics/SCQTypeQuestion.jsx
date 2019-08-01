import React, { Component } from "react";
import { Glyphicon, FormGroup, Checkbox } from "react-bootstrap";
import renderHTML from 'react-render-html';
import Explanation from './Explanation';

class SCQTypeQuestion extends Component {

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
        <div>
          <Explanation 
            data={this.props.questionDetails.explanation}
            onHide={this.handleHide.bind(this)}
            show={this.state.show}
          />
          <div className="index-head">
            <div className="left">
              <h4>Question : {this.props.questionDetails.quesNumber}</h4>
              <p>Single choice question</p>
            </div>
            <div className="right">
              <h4 className="explanation-button" onClick={()=>this.setState({show:true})}>View Explanation</h4>
              <Glyphicon 
                glyph={this.props.reviewDetails.status === 'correct' ? 'ok-circle' 
                  : this.props.reviewDetails.status === 'incorrect' ? 'remove-circle' : ''
                }
                style={{
                  color:this.props.reviewDetails.status === 'correct'? 
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
                        name={this.props.questionDetails.id} 
                        value={option.id} 
                        bsClass="my-radio"
                        checked={
                          this.props.questionDetails.userResult.userChoices.some(item=>{
                            return item === option.id
                          }) || this.props.questionDetails.correctOptions.some(item=>{
                            return item === option.id
                          })
                        }>
                        {renderHTML(option.optionText)}
                        <span className={"checkmark " + (this.props.questionDetails.correctOptions.some(item=>{
                                                          return item === option.id
                                                        }) ? 'correct' : '')}>
                        </span>
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
