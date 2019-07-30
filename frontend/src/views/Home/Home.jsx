import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";

import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";
import unitIcon from "../../assets/img/assets.jpg"
import placeholder from "../../assets/img/placeholder.jpg";

class Home extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      upcomingTests: [],
      busyCategories:true,
      busyTests:true
    };
  }

  componentDidMount() {
    this.fetchUpcomingTests();
    this.fetchCategories();
   }
 
  fetchCategories(){
    Axios.get("/api/app/tests/categories/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
      console.log(res.data)
      const data = res.data.map(item => {
        item.sno = res.data.indexOf(item) + 1;
        return item;
      })
      this.setState({data:data, busyCategories:false});
    }).catch( err=> {
      if(err.response.status === 401){
        this.props.logout(() =>{this.props.history.push('/')})
      }
    });
  }

  fetchUpcomingTests(){
    Axios.get("/api/app/tests/upcoming/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
      console.log('upcoming tests list', res.data)
      const data = res.data.map(item => {
        item.sno = res.data.indexOf(item) + 1;
        return item;
      })
      this.setState({upcomingTests:data, busyTests:false});
    }).catch( err=> {
      if(err.response.status === 401){
        this.props.logout(() =>{this.props.history.push('/')})
      }
    });
  }
  
  testFunction(id){
    this.props.history.push(`/app/test/start/${id}`)
  }
  handleUnitWise(){
    this.props.history.push('/home/subjects');
  }
  handleCategory(id){
    this.props.history.push(`/home/category/${id}`);
  }

  handleKeyPress(event){
    alert('pressed')
    if(event.key == 'Enter'){
      alert('pressed enter')
    }
  }

  render() {
    return (
      <div className="content home-content" tabIndex="0" onKeyPress={this.handleKeyPress.bind(this)}>
        <h4 className="title-heading">Upcoming Tests</h4>
        <div style={{display:'block',width:'100%', marginBottom:'20px'}}>
          {this.state.busyTests &&
            <div className="wait">
              <div className="loader"></div>
            </div>
          }
          {this.state.upcomingTests.length === 0 && !this.state.busyTests && <p className="no-tests-placeholder">No tests available</p>}
          {this.state.upcomingTests.map(item=>{
            return(
              <div className="home-cards">
                <Card
                  subTitle={item.isStarted ? 'Take Test' : 'Not Yet Started'}
                  content={item}
                  disabled={!item.isStarted}
                  color={!item.isStarted ? ' type4' : ''}
                  handleClick={this.testFunction.bind(this,item.id)}
                />
              </div>
            )
          })}
        </div>
        <h4 className="title-heading">Practice Tests</h4>
        {/* fixed card for unit wise tests */}
        <div style={{display:'block',width:'100%'}}>
        {this.state.busyTests &&
            <div className="wait">
              <div className="loader"></div>
            </div>
          }
          {!this.state.busyCategories &&
            <div className="home-cards">
              <Card
                image={unitIcon}
                title={'Unit Wise Tests'}
                handleClick={this.handleUnitWise.bind(this)}
              />
            </div>
          }
       {/* display cards after fetching from server */}
       {this.state.data.map(item=>{
          return(
            <div className="home-cards">
              <Card
                image={item.image !== null && item.image !== '' ? item.image : placeholder}
                title={item.title}
                handleClick={this.handleCategory.bind(this,item.id)}
                color={'type' + ((item.sno) % 4)}
              />
            </div>
          )
        })}
       </div>
      </div>
    );
  }
}

export default Home;
