import React, { Component } from "react";
import NotificationSystem from "react-notification-system";
import { Route, Switch, Redirect } from "react-router-dom";
import { Glyphicon, Modal } from "react-bootstrap";
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
      show:false,
      hashMap:null,
      expanded:null,
      lengthOfSection:null,
      sectionIndex: 0,
      questionIndex: 0,
      quesNumber:1,
      paraQues:0,
      ans: [],
      activeId: null,
      review: [],
      attempted: 0,
      unattempted: null,
      markedForReview: 0,
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
          activeId: data.sections[0].questions[0].id,
          unattempted: data.sections.reduce((sum,item)=>{
            sum = sum + item.totalQuestions
            return sum
          },0),
          lengthOfSection:data.sections[0].totalQuestions,
          quesNumber: data.sections[0].questions[0].questionType === 'passage' ?
            data.sections[0].questions[0].questions.length : 1,
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

  handleSubmit(){
    let processedData = this.state.ans.reduce((array,obj) => {
        if(array.some(item=>item.question===obj.question)){
          let index = array.findIndex(item=>item.question === obj.question);
          array[index].response.push(obj.option)
        }
        else
          array.push({
            question: obj.question,
            response: [obj.option],
            review: obj.review
          })
        return array
      }, [])

    let data = this.state.data.sections.reduce((ans, section)=>{
      section.questions.forEach((question)=>{
        if(question.questionType==='passage'){
          question.questions.forEach(paraQuestion => {
            if(this.state.ans.some(item => item.question === paraQuestion.id));
            else{
              ans.push({
                question: paraQuestion.id,
                response: [],
                review: false
              })
            }
          })
        }else{
          if(this.state.ans.some(item => item.question === question.id));
          else{
            ans.push({
              question: question.id,
              response: [],
              review: false
            })
          }
        }
      })
      return ans;
    },processedData);
    console.log(data)
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

  handleNavigation(sectionIndex, questionIndex, paraQuestionIndex){
    this.setState({
      sectionIndex: sectionIndex,
      questionIndex: questionIndex,
      paraQues: paraQuestionIndex,
      activeId: paraQuestionIndex === -1 ?
      this.state.data.sections[sectionIndex]
        .questions[questionIndex].id :
      this.state.data.sections[sectionIndex]
        .questions[questionIndex].questions[paraQuestionIndex].id
    })
  }

  handlePrevious(){
    if(this.state.questionIndex === 0){
      this.setState({
        questionIndex: this.state.data.sections[this.state.sectionIndex-1].questions.length-1,
        sectionIndex: this.state.sectionIndex - 1,
        lengthOfSection: this.state.data.sections[this.state.sectionIndex-1].totalQuestions,
        activeId: this.state.data.sections[this.state.sectionIndex-1].questions.slice(-1).pop()
        .questionType === 'passage' ?
        this.state.data.sections[this.state.sectionIndex-1].questions.slice(-1).pop()
        .questions.slice(-1).pop().id :
        this.state.data.sections[this.state.sectionIndex-1].questions.slice(-1).pop().id
      })
    }
    else{
      this.setState({
        questionIndex: this.state.questionIndex - 1,
        activeId: this.state.data.sections[this.state.sectionIndex]
        .questions[this.state.questionIndex-1].questionType === 'passage' ?
        this.state.data.sections[this.state.sectionIndex]
        .questions[this.state.questionIndex-1].questions.slice(-1).pop().id :
        this.state.data.sections[this.state.sectionIndex]
        .questions[this.state.questionIndex-1].id
      })
    }
  }

  handleNext(){
    if(this.state.questionIndex >= this.state.data.sections[this.state.sectionIndex].questions.length - 1 ){
      this.setState({
        questionIndex: 0,
        sectionIndex: this.state.sectionIndex + 1,
        lengthOfSection: this.state.data.sections[this.state.sectionIndex+1].totalQuestions,
        activeId: this.state.data.sections[this.state.sectionIndex+1]
        .questions[0].questionType === 'passage' ?
        this.state.data.sections[this.state.sectionIndex+1]
        .questions[0].questions[0].id :
        this.state.data.sections[this.state.sectionIndex+1]
        .questions[0].id
      })
    }
    else{
      this.setState({
        questionIndex: this.state.questionIndex + 1,
        activeId: this.state.data.sections[this.state.sectionIndex]
        .questions[this.state.questionIndex+1].questionType === 'passage' ?
        this.state.data.sections[this.state.sectionIndex]
        .questions[this.state.questionIndex+1].questions[0].id :
        this.state.data.sections[this.state.sectionIndex]
        .questions[this.state.questionIndex+1].id
      })
    }
  }

  handleAdd(obj){
    this.setState({
      ans:[
        ...this.state.ans,
        obj
      ],
    })
  }

  handleRemove(obj, type='none'){
    if(type === 'none'){
      this.setState({
        ans: this.state.ans.filter(item=>{
          return (item.question !== obj.question)
        })
      })
    }
    else if(type === 'mcq'){
      this.setState({
        ans: this.state.ans.filter(item=>{
          return (item.option !== obj.option)
        })
      })
    }
  }

  async handleResponse(e, quesId, optionId, questionType){
    if(questionType === 'scq' || questionType === 'passage' || questionType === 'integer'){
      if(this.state.ans.some(item=>{
        return (item.question === quesId && item.option !== optionId)
      })){
        await this.handleRemove({
          question:quesId,
          option: optionId,
          review: false
        })
        this.handleAdd({
          question:quesId,
          option: optionId,
          review: false
        })
      }
      else if(this.state.ans.some(item=>{
        return (item.question === quesId && item.option === optionId)
      })){
        this.setState({
          attempted: this.state.attempted - 1,
          unattempted: this.state.unattempted + 1
        })
        this.handleRemove({
          question:quesId,
          option: optionId,
          review: false
        })
      }
      else{
        this.setState({
          attempted: this.state.attempted + 1,
          unattempted: this.state.unattempted - 1
        })
        this.handleAdd({
          question:quesId,
          option: optionId,
          review: false
        })
      }
    }

    if(questionType === 'mcq'){
      if(this.state.ans.some(item=>{
        return (item.question === quesId && item.option === optionId)
      })){
        await this.handleRemove({
          question:quesId,
          option: optionId,
          review: false
        }, 'mcq')
        //check whether question is still attempted or not and update accordingly
        if(!this.state.ans.some(item=>item.question===quesId)){
          this.setState({
            unattempted: this.state.unattempted + 1,
            attempted: this.state.attempted - 1
          })
        }
      }
      else{
        if(!this.state.ans.some(item=>item.question===quesId)){
          this.setState({
            unattempted: this.state.unattempted - 1,
            attempted: this.state.attempted + 1
          })
        }
        this.handleAdd({
          question:quesId,
          option: optionId,
          review: false
        })
      }
    }
  }

  handleBack(){
    if(this.state.flag){
      this.setState({
        show:true
      })
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
        <Modal
          size="lg"
          show={this.state.show}
          keyboard={true}>
          <Modal.Body bsClass="modal-body mymodal">
            <h4>Centered Modal</h4>
            <p>
              Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
              dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta
              ac consectetur ac, vestibulum at eros.
            </p>
          </Modal.Body>
        </Modal>
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
              ans={this.state.ans}
              review={this.state.review}
              expanded={this.state.expanded}
              attempted={this.state.attempted}
              unattempted={this.state.unattempted}
              markedForReview={this.state.markedForReview}
              handleNext={this.handleNext.bind(this)}
              handlePrevious={this.handlePrevious.bind(this)}
              toggle={(id) => {this.toggle(id)}}
              questionIndex={this.state.questionIndex}
              sectionIndex={this.state.sectionIndex}
              paraQues={this.state.paraQues}
              activeId={this.state.activeId}
              handleResponse={(e,qid,oid,qtype)=>this.handleResponse(e,qid,oid,qtype)}
              handleNavigation={(sindex,qindex,pindex)=>this.handleNavigation(sindex,qindex,pindex)}
              handleSubmit={this.handleSubmit.bind(this)}
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
