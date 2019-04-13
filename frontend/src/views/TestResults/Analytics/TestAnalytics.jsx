import React, { Component } from "react";
import { Glyphicon, FormGroup, Radio } from "react-bootstrap";
import Timer from "react-compound-timer";
import SCQType from "./SCQTypeQuestion";
import MCQType from "./MCQTypeQuestion";
import IntegerType from "./IntegerTypeQuestion";
import ParagraphType from "./ParagraphTypeQuestion";

class TestAnalytics extends Component {

  render() {
    return (
        <div className="main-body">
          <div className="nav-right">
            <div className="content">
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
              <div style={{overflowY: 'scroll', height:'60%'}}>
              {this.props.data.sections.map(section =>{
                return(
                    <div className="section" key={section.id}>
                      <div className={"section-header " + (this.props.expanded[section.id] ? "header-expanded": '')} onClick={()=>this.props.toggle(section.id)}>
                        <h5>{section.title}</h5>
                        <Glyphicon glyph="menu-down" className={"icon "+ (this.props.expanded[section.id] ? "icon-expanded" : '')}/>
                      </div>
                      <div className={"section-body " + (this.props.expanded[section.id] ? "body-expanded": '')}>
                        {this.props.expanded[section.id] ?
                            this.props.questions[this.props.data.sections.findIndex(item=> item === section)]
                            .questions.map(question=>{
                          return(
                              <a>
                                <div 
                                  className="question-badge"
                                  onClick={
                                    () => {
                                      let sectionIndex = this.props.data.sections.findIndex(item=>{
                                        return item === section
                                      })
                                      let questionIndex = this.props.questions[this.props.data.sections
                                        .findIndex(item=> item === section)].questions.findIndex(item=>{
                                          return item === question
                                      })
                                      this.props.handleNavigation(sectionIndex, questionIndex, -1)
                                    }
                                  }
                                  >
                                  {question.quesNumber}
                                </div>
                              </a>
                            )
                          }) : null
                        }
                      </div>
                    </div>
                  )
              })}
              </div>
            </div>
          </div>
          <div className="body">
            <div className="content">
              {
                this.props.questions[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'passage' ?

                <ParagraphType data={this.props.questions[this.props.sectionIndex]
                .questions[this.props.questionIndex].questions}
                  ans={this.props.ans}
                  reviewDetails={this.props.reviewDetails}
                  questionDetails={this.props.questionDetails}
                  handleReview={(id)=>this.props.handleReview(id)}
                  handleResponse={(e,qid,oid,qtype)=>this.props.handleResponse(e,qid,oid,qtype)}
                /> :

                this.props.questions[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'integer' ?
                
                <IntegerType data={this.props.questions[this.props.sectionIndex]
                .questions[this.props.questionIndex]}  
                  ans={this.props.ans}
                  reviewDetails={this.props.reviewDetails}
                  questionDetails={this.props.questionDetails}
                  handleReview={(id)=>this.props.handleReview(id)}
                  handleResponse={(e,qid,oid,qtype)=>this.props.handleResponse(e,qid,oid,qtype)}/> :

                this.props.questions[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'scq' ?

                <SCQType data={this.props.questions[this.props.sectionIndex]
                .questions[this.props.questionIndex]}  
                  ans={this.props.ans}
                  reviewDetails={this.props.reviewDetails}
                  questionDetails={this.props.questionDetails}
                  handleReview={(id)=>this.props.handleReview(id)}
                  handleResponse={(e,qid,oid,qtype)=>this.props.handleResponse(e,qid,oid,qtype)}
                   /> :

                this.props.questions[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'mcq' ?
                
                <MCQType data={this.props.questions[this.props.sectionIndex]
                .questions[this.props.questionIndex]}  
                  ans={this.props.ans}
                  reviewDetails={this.props.reviewDetails}
                  questionDetails={this.props.questionDetails}
                  handleReview={(id)=>this.props.handleReview(id)}
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

export default TestAnalytics;
