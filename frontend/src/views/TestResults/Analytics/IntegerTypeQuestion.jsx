import React, { Component } from "react";
import { Glyphicon, FormGroup, Checkbox } from "react-bootstrap";
import renderHTML from 'react-render-html';
import Explanation from './Explanation';

const integers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
class IntegerTypeQuestion extends Component {

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
              <p>Integer Type Question</p>
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
            <div className="integer-options">
              {integers.map(int=>{
                return(
                    <div 
                      className={'integer-option-btn '+
                        (this.props.questionDetails.intAnswer === int
                          ? "correctInt" : 
                         this.props.questionDetails.userResult.userIntAnswer === int
                          ? "int-selected" : "")}
                      key={int}>
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

export default IntegerTypeQuestion;
