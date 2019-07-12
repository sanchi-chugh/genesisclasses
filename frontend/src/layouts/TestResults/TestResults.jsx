import React, { Component } from "react";
import NotificationSystem from "react-notification-system";
import { Route, Switch, Redirect } from "react-router-dom";
import { Glyphicon, Modal } from "react-bootstrap";
import TakeTest from "../../views/TakeTest/TakeTest";
import Results from "../../views/TestResults/Results";
import TestAnalytics from "../../views/TestResults/Analytics/TestAnalytics";
import axios from 'axios';
import { style } from "../../variables/Variables.jsx";

import '../../assets/css/app.css';

class TestResultsLayout extends Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.ref = {}
    this.window = {}
    this.state = {
      busy: true,
      flag: true,
      expanded:{},
      questions:null,
      questionIndex: 0,
      sectionIndex: 0,
      activeId: null,
      questionDetails: null,
      reviewDetails: null,
      disabled:{
        next: false,
        prev: true
      },
      buttonBusy:false
    };
  }

  componentDidMount() {
    this.setState({ _notificationSystem: this.refs.notificationSystem });
    this.fetchTestAnalytics();
    var _notificationSystem = this.refs.notificationSystem;
  }

  fetchTestAnalytics(){
    axios.get(`/api/app/tests/${this.props.match.params.id}/result/questionWiseAnalysis/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        },
    }).then(async (res) => {
        const data = res.data.detail;
        console.log(data)
        const questions = await this.getData(data.sections[0].questions);
        const reviewDetails = await questions.questions[0];
        const questionDetails = await this.getData(reviewDetails.question);
        this.setState({
          data:data,
          questions: [questions, ...Array(data.sections.length-1).fill(null)],
          reviewDetails: reviewDetails,
          questionDetails: questionDetails,
          expanded: data.sections.reduce((obj, item) => {
             if(item === data.sections[0])
                obj[item.id] = true;
             else
               obj[item.id] = false
             return obj
           }, {}),
        },()=>this.setState({busy:false},console.log(this.state)));
    }).catch( err=> {
      if(err.response.status === 401){
        this.props.logout(() =>{this.props.history.push('/')})
      }
    });
  }
  //toggle right side navigation headers
  async getData(url){
    await this.setState({
      busyButton: true
    })
    return axios.get(url, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        },
      }).then(res => {
          const data = res.data.detail;
          this.setState({busyButton:false})
          return data;
      }).catch( err=> {
          if(err.response.status === 401){
            this.props.logout(() =>{this.props.history.push('/')})
          }
        });
  }

  setRefs(ref, id){
    this.ref[id] = React.createRef();
    this.ref[id] = ref;
  }

  setWindow(ref){
    this.window = React.createRef();
    this.window = ref
  }

  async toggle(id){
    if (!this.state.questions.some(item => {
      if(item!==null)
        return item.id === id
      else
        return false
    })){
      const index = this.state.data.sections.findIndex(item=> item.id === id);
      const newSet = await this.getData(this.state.data.sections[index].questions);
      await this.setState(prevState =>{
        const { questions } = prevState;
        questions[index] = newSet;
      })
    }
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

  async handleNavigation(sectionIndex, questionIndex, paraQuestionIndex){
    let bool = {
      next: false,
      prev: false
    }
    if(sectionIndex >= this.state.questions.length - 1 &&
      questionIndex >= this.state.questions[sectionIndex].questions.length - 1){
      bool = {
        next: true,
        prev: false
      }
    }else if(
        sectionIndex === 0 && questionIndex === 0
      ){
      bool = {
        next: false,
        prev: true
      }
    }
    const reviewDetails = await this.state.questions[sectionIndex].questions[questionIndex]
    const questionDetails = await this.getData(reviewDetails.question);
    await this.setState({
      sectionIndex: sectionIndex,
      questionIndex: questionIndex,
      paraQues: paraQuestionIndex,
      questionDetails: questionDetails,
      reviewDetails: reviewDetails,
      disabled: bool
    })
    console.log('para ', paraQuestionIndex, questionIndex )
    if(paraQuestionIndex !== -1){
      let id = this.state.questions[sectionIndex].questions[paraQuestionIndex].id
      this.window.scrollTop =  this.ref[id].offsetTop - 200
    }
  }

  async handlePrevious(){
    let bool = {
      next: false,
      prev: false
    }
    if(this.state.questionIndex === 0){
      if(this.state.questions[this.state.sectionIndex-1].questions.length-1 === 0){
        bool = {
          prev: true,
          next: false
        }
      }
      if (this.state.questions[this.state.sectionIndex - 1] === null){
        const index = this.state.sectionIndex + 1;
        const newSet = await this.getData(this.state.data.sections[index].questions);
        await this.setState(prevState =>{
          const { questions } = prevState;
          questions[index] = newSet;
        })
      }
      const reviewDetails = await this.state.questions[this.state.sectionIndex - 1]
        .questions[this.state.questions[this.state.sectionIndex-1].questions.length-1]
      const questionDetails = await this.getData(reviewDetails.question);
      this.setState({
        questionIndex: this.state.questions[this.state.sectionIndex-1].questions.length-1,
        sectionIndex: this.state.sectionIndex - 1,
        questionDetails: questionDetails,
        reviewDetails: reviewDetails,
        disabled: bool
      })
    }
    else{
      if((this.state.questionIndex === 1) && this.state.sectionIndex === 0){
        bool = {
          prev: true,
          next: false
        }
      }
      const reviewDetails = await this.state.questions[this.state.sectionIndex].questions[this.state.questionIndex-1]
      const questionDetails = await this.getData(reviewDetails.question);

      await this.setState({
        questionIndex: this.state.questionIndex - 1,
        questionDetails: questionDetails,
        reviewDetails: reviewDetails,
        disabled: bool
      })
      if(reviewDetails.questionType === 'passage'){
        let id = this.state.questions[this.state.sectionIndex].questions[this.state.questionIndex].id
        this.window.scrollTop =  this.ref[id].offsetTop - 200
      }
    }
  }

  async handleNext(){
    let bool = {
      next: false,
      prev: false
    }
    if(this.state.questionIndex >= this.state.questions[this.state.sectionIndex].questions.length - 1 ){
      if (this.state.questions[this.state.sectionIndex + 1] === null){
        const index = this.state.sectionIndex + 1;
        const newSet = await this.getData(this.state.data.sections[index].questions);
        await this.setState(prevState =>{
          const { questions } = prevState;
          questions[index] = newSet;
        })
      }
      const reviewDetails = await this.state.questions[this.state.sectionIndex + 1].questions[0]
      const questionDetails = await this.getData(reviewDetails.question);
      this.setState({
        questionIndex: 0,
        sectionIndex: this.state.sectionIndex + 1,
        questionDetails: questionDetails,
        reviewDetails: reviewDetails,
        disabled: bool
      })
    }
    else{
      if(this.state.sectionIndex >= this.state.questions.length - 1 
        && this.state.questionIndex >= this.state.questions[this.state.sectionIndex].questions.length - 2){
        bool = {
          next: true,
          prev: false
        }
      }
      const reviewDetails = await this.state.questions[this.state.sectionIndex].questions[this.state.questionIndex+1]
      const questionDetails = await this.getData(reviewDetails.question);
      await this.setState({
        questionIndex: this.state.questionIndex + 1,
        questionDetails: questionDetails,
        reviewDetails: reviewDetails,
        disabled: bool
      })
      if(reviewDetails.questionType === 'passage'){
        let id = this.state.questions[this.state.sectionIndex].questions[this.state.questionIndex].id
        this.window.scrollTop =  this.ref[id].offsetTop - 200
      }
    }
  }

  handleBack(){
    this.setState({flag:false});
    console.log(this.props)
    if(this.props.history.location.pathname.split('/')[1] === 'app'){
      console.log('app')
      this.props.history.push('/')
    }else{
      console.log('back')
      this.props.history.goBack();
    }
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
              <a onClick={this.handleBack.bind(this)}>
                <Glyphicon 
                  glyph="chevron-left" 
                  style={{display: 'inline-block', float:'left', color: '#01458E',fontSize: '18px'}}
                />
              </a>
              <h3>{this.state.data.title}</h3>
            </div>
          </div>
          {this.state.busyButton && <div className="loader"></div>}
          {
            this.state.flag ?
            <TestAnalytics 
              data={this.state.data}
              questions={this.state.questions}
              expanded={this.state.expanded}
              toggle={(id) => {this.toggle(id)}}
              questionIndex={this.state.questionIndex}
              sectionIndex={this.state.sectionIndex}
              activeId={this.state.activeId}
              disabled={this.state.disabled}
              questionDetails={this.state.questionDetails}
              reviewDetails={this.state.reviewDetails}
              handleNavigation={this.handleNavigation.bind(this)}
              handlePrevious={this.handlePrevious.bind(this)}
              handleNext={this.handleNext.bind(this)}
              setRefs={(ref, id) => this.setRefs(ref,id)}
              setWindow={(ref) => this.setWindow(ref)}
              busyButton={this.state.busyButton}
            /> :
            <Results />
          } 
        </div>
      </div>
    );
  }
}

export default TestResultsLayout;
