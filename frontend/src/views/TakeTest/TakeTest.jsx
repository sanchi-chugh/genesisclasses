import React, { Component } from "react";
import { Glyphicon, FormGroup, Radio } from "react-bootstrap";
import Timer from "react-compound-timer";
import SCQType from "./SCQTypeQuestion";
import MCQType from "./MCQTypeQuestion";
import IntegerType from "./IntegerTypeQuestion";
import ParagraphType from "./ParagraphTypeQuestion";

class TakeTest extends Component {

  render() {
    return (
        <div className="main-body">
          <div className="nav-right">
            <div className="content">
              <div className="timer">
                <Timer 
                  initialTime={(parseInt(this.props.data.duration.split(':')[0]) * 60 + parseInt(this.props.data.duration.split(':')[1])) * 60 * 1000} 
                  direction="backward" 
                  formatValue={(value) => `${(value < 10 ? `0${value}` : value)} `}>
                    {() => (
                      <React.Fragment>
                          <Timer.Hours />{' : '} 
                          <Timer.Minutes />{' : '} 
                          <Timer.Seconds />
                      </React.Fragment>
                    )}
                </Timer>
              </div>
              <div className="timer-units">
                <ul>
                  <li>HOURS</li>
                  <li>MINS</li>
                  <li>SECS</li>
                </ul>
              </div>
              <div className="labels">
                  <div style={{marginBottom:'8px'}}>
                    <div className="disc" id="unattempted"></div>
                    <div className="inline-labels">Unattempted <span style={{fontSize:'12px'}}> {this.props.unattempted} </span></div>
                  </div>
                  <div style={{marginBottom:'8px'}}>
                    <div className="disc" id="review"></div>
                    <div className="inline-labels">Marked For Review <span style={{fontSize:'12px'}}> {this.props.markedForReview} </span></div>
                  </div>
                  <div style={{marginBottom:'8px'}}>
                    <div className="disc" id="attempted"></div>
                    <div className="inline-labels">Attempted <span style={{fontSize:'12px'}}> {this.props.attempted} </span></div>
                  </div>
              </div>
              {this.props.data.sections.map(section =>{
                return(
                    <div className="section" key={section.id}>
                      <div className={"section-header " + (this.props.expanded[section.id] ? "header-expanded": '')} onClick={()=>this.props.toggle(section.id)}>
                        <h5>{section.title}</h5>
                        <Glyphicon glyph="menu-down" className={"icon "+ (this.props.expanded[section.id] ? "icon-expanded" : '')}/>
                      </div>
                      <div className={"section-body " + (this.props.expanded[section.id] ? "body-expanded": '')}>
                        {section.questions.map(question=>{
                          if(question.questionType === 'passage'){
                              return (
                                  question.questions.map(paraQues => {
                                    return(
                                        <a>
                                          <div 
                                            className="question-badge"
                                            onClick={
                                              () => {
                                                let sectionIndex = this.props.data.sections.findIndex(item=>{
                                                  return item === section
                                                })
                                                let questionIndex = section.questions.findIndex(item=>{
                                                  return item === question
                                                })
                                                let paraQuestionIndex = question.questions.findIndex(item =>{
                                                  return item === paraQues
                                                })
                                                this.props.handleNavigation(sectionIndex, questionIndex, paraQuestionIndex)
                                              }
                                            }
                                            id={
                                                this.props.activeId === paraQues.id
                                              ? 'active'
                                              : this.props.ans.some(item => item.question === paraQues.id)
                                              ? 'attempted'
                                              : this.props.review.some(item => item.question === paraQues.id)
                                              ?  'review'
                                              : 'unattempted'
                                            }>
                                            {paraQues.quesNumber}
                                          </div>
                                        </a>
                                      )
                                  })
                                )
                          }else{
                            return(
                                <a>
                                  <div 
                                    className="question-badge"
                                    onClick={
                                      () => {
                                        let sectionIndex = this.props.data.sections.findIndex(item=>{
                                          return item === section
                                        })
                                        let questionIndex = section.questions.findIndex(item=>{
                                          return item === question
                                        })
                                        this.props.handleNavigation(sectionIndex, questionIndex, -1)
                                      }
                                    }
                                    id={
                                        this.props.activeId === question.id
                                      ? 'active'
                                      : this.props.ans.some(item => item.question === question.id)
                                      ? 'attempted' 
                                      : this.props.review.some(item => item.question === question.id)
                                      ?  'review'
                                      : 'unattempted'
                                    }>
                                    {question.quesNumber}
                                  </div>
                                </a>
                              )
                          }
                        })}
                      </div>
                    </div>
                  )
              })}
              <div className="button">
                <div className="submit-btn">
                  SUBMIT TEST
                </div>
              </div>
            </div>
          </div>
          <div className="body">
            <div className="content">
              {
                this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'passage' ?

                <ParagraphType data={this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].questions}
                  ans={this.props.ans}
                  paragraph={this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].paragraph}
                  handleResponse={(e,qid,oid,qtype)=>this.props.handleResponse(e,qid,oid,qtype)}
                /> :

                this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'integer' ?
                
                <IntegerType data={this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex]}  
                  ans={this.props.ans}
                  handleResponse={(e,qid,oid,qtype)=>this.props.handleResponse(e,qid,oid,qtype)}/> :

                this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'scq' ?

                <SCQType data={this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex]}  
                  ans={this.props.ans}
                  handleResponse={(e,qid,oid,qtype)=>this.props.handleResponse(e,qid,oid,qtype)}
                   /> :

                this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'mcq' ?
                
                <MCQType data={this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex]}  
                  ans={this.props.ans}
                  handleResponse={(e,qid,oid,qtype)=>this.props.handleResponse(e,qid,oid,qtype)}/> : ''
              }
            </div>
          </div>
          <div className="footer">
            <div className="previous-btn" onClick={this.props.handlePrevious}>
              PREVIOUS
            </div>
            <div className="next-btn" onClick={this.props.handleNext}>
              NEXT
            </div>
          </div>
        </div>
    );
  }
}

export default TakeTest;
