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
    this.state = {
      busy: true,
      flag: true,
      expanded:{},
      questions:null,
      questionIndex: 0,
      sectionIndex: 0,
      activeId: null,
      questionDetails: null,
      reviewDetails: null
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
        const questions = await this.getData(data.sections[0].questions);
        const reviewDetails = await questions.questions[0];
        const questionDetails = await this.getData(reviewDetails.question);
        this.setState({
          data:data,
          questions: [questions, null, null, null, null, null, null, null],
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
    });
  }
  //toggle right side navigation headers
  getData(url){
    return axios.get(url, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        },
    }).then(res => {
        const data = res.data.detail;
          return data;
    });
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
    const reviewDetails = await this.state.questions[sectionIndex].questions[questionIndex]
    const questionDetails = await this.getData(reviewDetails.question);
    
    this.setState({
      sectionIndex: sectionIndex,
      questionIndex: questionIndex,
      paraQues: paraQuestionIndex,
      questionDetails: questionDetails,
      reviewDetails: reviewDetails
    })
  }

  async handlePrevious(){
    if(this.state.questionIndex === 0){
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
        reviewDetails: reviewDetails
      })
    }
    else{
      const reviewDetails = await this.state.questions[this.state.sectionIndex].questions[this.state.questionIndex-1]
      const questionDetails = await this.getData(reviewDetails.question);

      this.setState({
        questionIndex: this.state.questionIndex - 1,
        questionDetails: questionDetails,
        reviewDetails: reviewDetails
      })
    }
  }

  async handleNext(){
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
        reviewDetails: reviewDetails
      })
    }
    else{
      const reviewDetails = await this.state.questions[this.state.sectionIndex].questions[this.state.questionIndex+1]
      const questionDetails = await this.getData(reviewDetails.question);

      this.setState({
        questionIndex: this.state.questionIndex + 1,
        questionDetails: questionDetails,
        reviewDetails: reviewDetails
      })
    }
  }

  handleBack(){
    this.setState({flag:false});
    console.log(this.props)
    if(this.props.history.location.pathname.split('/')[1] === 'app'){
      this.props.history.push('/')
    }else{
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
              questionDetails={this.state.questionDetails}
              reviewDetails={this.state.reviewDetails}
              handleNavigation={this.handleNavigation.bind(this)}
              handlePrevious={this.handlePrevious.bind(this)}
              handleNext={this.handleNext.bind(this)}
            /> :
            <Results />
          } 
        </div>
      </div>
    );
  }
}

export default TestResultsLayout;
