import React, { Component } from "react";
import NotificationSystem from "react-notification-system";
import { Route, Switch, Redirect } from "react-router-dom";
import { Glyphicon } from "react-bootstrap";
import TakeTest from "../../views/TakeTest/TakeTest";
import Instructions from "../../views/TakeTest/Instructions";
import axios from 'axios';
import { toggleFullScreen }  from "../../utils.jsx";
import { style } from "../../variables/Variables.jsx";

import '../../assets/css/app.css';

class TakeTestLayout extends Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.state = {
      expanded:false,
      busy:true,
      data:null,
      flag:false,
      hashMap:null,
      expanded:null,
      lengthOfSection:null,
      sectionIndex: 0,
      questionIndex: 0,
      quesNumber:1,
      paraQues:0,
      ans: null,
      attempted: 0,
      unattempted: null,
      markedForReview: 0
    };
  }

  componentDidMount() {
    toggleFullScreen();
    this.fetchTestDetails();
    this.setState({ _notificationSystem: this.refs.notificationSystem });
    var _notificationSystem = this.refs.notificationSystem;
  }

  fetchTestDetails(){
    axios.get(`/api/app/tests/${this.props.match.params.id}/detail/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        },
        onDownloadProgress: progressEvent => {
        let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
        // do whatever you like with the percentage complete
        // maybe dispatch an action that will update a progress bar or something
        console.log(percentCompleted)
      }
    }).then(res => {
        console.log(res.data)
        const data = res.data.detail;
        const hashMap = this.createHashMap(data.sections);
        this.setState({
          data:data,  
          hashMap:hashMap,
          expanded: data.sections.reduce((obj, item) => {
             if(item === data.sections[0])
                obj[item.id] = true;
             else
               obj[item.id] = false
             return obj
           }, {}),
          lengthOfSection:data.sections[0].totalQuestions,
          unattempted:data.sections.reduce((sum, item) =>{
            return sum + item.totalQuestions;
          }, 0),
        },()=>this.setState({busy:false}));
    });
  }

  createHashMap(data){
    let hashMap=[];
    data.forEach(section=>{
      const map = section.questions.reduce((obj,item)=>{
        if(item.questionType === 'passage'){
            let someObject = item.questions.reduce((paraObj, paraItem)=>{
            paraObj[paraItem.quesNumber] = {
              qindex: section.questions.indexOf(item),
              pindex: item.questions.indexOf(paraItem)
            }
            if( 
                item.questions.indexOf(paraItem) === item.questions.length-1 && 
                section.questions.indexOf(item) === section.questions.length-1
              )
              paraObj['lastPQNO'] = item.questions.indexOf(paraItem)
            return paraObj;
          },{})
          obj = {...obj, ...someObject}
        }else{
          obj[item.quesNumber] = section.questions.indexOf(item)
        }
        if(section.questions.indexOf(item) === section.questions.length-1)
          if(item.questionType === 'passage')
            obj['lastQNO']=item.questions[item.questions.length-1].quesNumber
          else
            obj['lastQNO']=item.quesNumber
        return obj;
      },{});
      hashMap.push(map);
    })
    console.log(hashMap)
    return hashMap;
  }

  toggle(id){
    this.setState({
      expanded: this.state.data.sections.reduce((obj, item) => {
         if(item.id === id)
            obj[item.id] = true;
         else
           obj[item.id] = false
         return obj
       }, {})
    })
  }

  handlePrevious(){
    if(this.state.quesNumber === 1){
      this.setState({
        questionIndex: this.state.hashMap[this.state.sectionIndex-1].lastPQNO !== undefined ?
         this.state.hashMap[this.state.sectionIndex-1][
          this.state.hashMap[this.state.sectionIndex-1].lastQNO
        ].qindex : 
        this.state.hashMap[this.state.sectionIndex-1][
          this.state.hashMap[this.state.sectionIndex-1].lastQNO
        ],
        sectionIndex: this.state.sectionIndex - 1,
        lengthOfSection: this.state.data.sections[this.state.sectionIndex-1].totalQuestions,
        quesNumber: this.state.hashMap[this.state.sectionIndex-1].lastQNO,
        paraQues: this.state.hashMap[this.state.sectionIndex-1].lastPQNO !== undefined ?
        this.state.hashMap[this.state.sectionIndex-1].lastPQNO : 0,
      })
    }
    else if(this.state.data.sections[this.state.sectionIndex]
      .questions[this.state.questionIndex].questionType === 'passage'){
      if(this.state.paraQues > 0){
          this.setState({
            paraQues: this.state.paraQues - 1,
            quesNumber: this.state.quesNumber - 1
          });
        }
      else if(this.state.paraQues <= 0){
        this.setState({
          paraQues: 0,
          quesNumber: this.state.quesNumber - 1,
          questionIndex: this.state.hashMap[this.state.sectionIndex][this.state.quesNumber - 1],
        });
      }
    }
    else if(this.state.data.sections[this.state.sectionIndex]
      .questions[this.state.questionIndex-1].questionType === 'passage'){
      this.setState({
        paraQues: this.state.data.sections[this.state.sectionIndex]
          .questions[this.state.questionIndex-1].questions.length-1,
        questionIndex: this.state.hashMap[this.state.sectionIndex][this.state.quesNumber - 1].qindex,
        quesNumber: this.state.quesNumber - 1
      },()=> console.log(this.state))
    }
    else{
      this.setState({
        questionIndex: this.state.hashMap[this.state.sectionIndex][this.state.quesNumber - 1],
        quesNumber: this.state.quesNumber - 1
      })
    }
  }

  handleNext(){
    console.log(this.state)
    if(this.state.quesNumber >= this.state.lengthOfSection){
      this.setState({
        questionIndex: 0,
        sectionIndex: this.state.sectionIndex + 1,
        lengthOfSection: this.state.data.sections[this.state.sectionIndex+1].totalQuestions,
        quesNumber: 1,
        paraQues: 0
      })
    }
    else if(this.state.data.sections[this.state.sectionIndex]
      .questions[this.state.questionIndex].questionType === 'passage'){
      if(this.state.paraQues < (this.state.data.sections[this.state.sectionIndex]
            .questions[this.state.questionIndex].questions.length - 1)){
          this.setState({
            paraQues: this.state.paraQues + 1,
            quesNumber: this.state.quesNumber + 1
          });
        }
      else if(this.state.paraQues >= (this.state.data.sections[this.state.sectionIndex]
            .questions[this.state.questionIndex].questions.length - 1)){
        this.setState({
          paraQues: 0,
          quesNumber: this.state.quesNumber + 1,
          questionIndex: this.state.questionIndex + 1,
        });
      }
    }
    else if(this.state.data.sections[this.state.sectionIndex]
      .questions[this.state.questionIndex+1].questionType === 'passage'){
      this.setState({
        paraQues: 0,
        questionIndex: this.state.hashMap[this.state.sectionIndex][this.state.quesNumber + 1].qindex,
        quesNumber: this.state.quesNumber + 1
      })
    }
    else{
      this.setState({
        questionIndex: this.state.hashMap[this.state.sectionIndex][this.state.quesNumber + 1],
        quesNumber: this.state.quesNumber + 1
      })
    }
  }

  handleBack(){
    if(this.state.flag){

    }else{
      this.setState({flag:false});
      toggleFullScreen();
      this.props.history.goBack();
    }
  }

  startTest(){
    this.setState({
      flag:true
    })
  }

  render() {
    if(this.state.busy)
      return(
          <div className="loader"></div>
        )
    return (
      <div className="wrapper" id="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <div id="main-panel" className="wrapper-test main-panel-expanded" ref="mainPanel">
          <div className="header">
            <div className="content">
              <a onClick={this.handleBack.bind(this)}><Glyphicon glyph="chevron-left" style={{display: 'inline-block', float:'left', color: '#01458E',fontSize: '18px'}}/></a>
              <h3>{this.state.data.title}</h3>
            </div>
          </div>
          {
            this.state.flag ?
            <TakeTest 
              data={this.state.data}
              expanded={this.state.expanded}
              attempted={this.state.attempted}
              unattempted={this.state.attempted}
              markedForReview={this.state.markedForReview}
              handleNext={this.handleNext.bind(this)}
              handlePrevious={this.handlePrevious.bind(this)}
              toggle={(id) => {this.toggle(id)}}
              questionIndex={this.state.questionIndex}
              sectionIndex={this.state.sectionIndex}
              paraQues={this.state.paraQues}
            /> :
            <Instructions 
              data={this.state.data}
              startTest={this.startTest.bind(this)}
            />
          }
        </div>
      </div>
    );
  }
}

export default TakeTestLayout;
