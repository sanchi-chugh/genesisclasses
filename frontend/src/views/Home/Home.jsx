import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";

import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";


class Home extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      upcomingTests: [],
    };
  }

  componentDidMount() {
    this.fetchCategories();
    this.fetchUpcomingTests();
   }
 
  fetchCategories(){
    Axios.get("/api/app/tests/categories/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
      const data = res.data.map(item => {
        item.sno = res.data.indexOf(item) + 1;
        return item;
      })
      this.setState({data:data});
    });
  }

  fetchUpcomingTests(){
    Axios.get("/api/app/tests/upcoming/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
      const data = res.data.map(item => {
        item.sno = res.data.indexOf(item) + 1;
        return item;
      })
      this.setState({upcomingTests:data});
    });
  }
  testFunction(){
    alert('Clicked')
  }
  render() {
    return (
      <div className="content home-content">
        <Grid fluid>
          <h4 className="title-heading">Upcoming Tests</h4>
          <Row>
          {this.state.upcomingTests.map(item=>{
              return(
                <Col lg={3} sm={6}>
                  <Card
                    title={item.title}
                    content={item}
                    disabled={this.state.data.isStarted}
                    handleClick={this.testFunction.bind(this)}
                  />
                </Col>
              )
            })}
          </Row>
          <h4 className="title-heading">Practice Tests</h4>
          <Row> 
            {/* fixed card for unit wise tests */}
                <Col lg={3} sm={6}>
                  <Card
                    image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                    title={'Unit Wise Tests'}
                    handleClick={this.testFunction.bind(this)}
                  />
                </Col>
            {/* display cards after fetching from server */}
            {this.state.data.map(item=>{
              return(
                <Col lg={3} sm={6}>
                  <Card
                    image={item.image !== null && item.image !== '' ? item.image :'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                    title={item.title}
                    handleClick={this.testFunction.bind(this)}
                    color={'type' + ((item.sno) % 4)}
                  />
                </Col>
              )
            })}
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Home;
