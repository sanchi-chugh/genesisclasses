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
                  <div>
                    <div className="disc" style={{backgroundColor:'#01458E'}}></div>
                    <div className="inline-labels">Unattempted <span style={{fontSize:'12px'}}> {this.props.unattempted} </span></div>
                  </div>
                  <div>
                    <div className="disc" style={{backgroundColor:'#01458E'}}></div>
                    <div className="inline-labels">Marked For Review <span style={{fontSize:'12px'}}> {this.props.markedForReview} </span></div>
                  </div>
                  <div>
                    <div className="disc" style={{backgroundColor:'#01458E'}}></div>
                    <div className="inline-labels">Attempted <span style={{fontSize:'12px'}}> {this.props.attempted} </span></div>
                  </div>
              </div>
              {this.props.data.sections.map(item =>{
                return(
                    <div className="section" key={item.id}>
                      <div className={"section-header " + (this.props.expanded[item.id] ? "header-expanded": '')} onClick={()=>this.props.toggle(item.id)}>
                        <h5>Section : Part A</h5>
                        <Glyphicon glyph="menu-down" className={"icon "+ (this.props.expanded[item.id] ? "icon-expanded" : '')}/>
                      </div>
                      <div className={"section-body " + (this.props.expanded[item.id] ? "body-expanded": '')}>
                        {item.questions.map(object=>{
                          if(object.questionType === 'passage'){
                              return (
                                  <div>
                                    {
                                      object.questions.map(paraQues => {
                                        return(
                                            <a>
                                              <div className="question-badge" id="type1"><span style={{margin: 'auto', padding: '4px'}}>{paraQues.quesNumber}</span></div>
                                            </a>
                                          )
                                      })
                                    }
                                  </div>
                                )
                          }else{
                            return(
                                <a>
                                  <div className="question-badge" id="type1"><span style={{margin: 'auto', padding: '4px'}}>{object.quesNumber}</span></div>
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
                  paragraph={this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].paragraph}
                /> :

                this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'integer' ?
                
                <IntegerType data={this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex]}/> :

                this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'scq' ?

                <SCQType data={this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex]}/> :

                this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex].questionType === 'mcq' ?
                
                <MCQType data={this.props.data.sections[this.props.sectionIndex]
                .questions[this.props.questionIndex]}/> : ''
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
