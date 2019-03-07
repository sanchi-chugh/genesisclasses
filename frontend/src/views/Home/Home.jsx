import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";

import { Card } from "../../WebAppComponents/Card/Card.jsx";


class Home extends Component {
  
  createLegend(json) {
    var legend = [];
    for (var i = 0; i < json["names"].length; i++) {
      var type = "fa fa-circle text-" + json["types"][i];
      legend.push(<i className={type} key={i} />);
      legend.push(" ");
      legend.push(json["names"][i]);
    }
    return legend;
  }
  render() {
    return (
      <div className="content home-content">
        <Grid fluid>
          <h4 className="title-heading">Upcoming Tests</h4>
          <Row>
            <Col lg={3} sm={6}>
              <Card
                image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                title={'Take Test'}
                subTitle={''}
              />
            </Col>
            <Col lg={3} sm={6}>
              <Card
                image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                title={'Take Test'}
                subTitle={''}
                color={''}
              />
            </Col>
            <Col lg={3} sm={6}>
              <Card
                image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                title={'Take Test'}
                subTitle={''}
                color={''}
              />
            </Col>
            <Col lg={3} sm={6}>
              <Card
                image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                title={'Unit Wise Test'}
                subTitle={''}
                color={''}
              />
            </Col>
          </Row>
          <h4 className="title-heading">Practice Tests</h4>
          <Row>
            <Col lg={3} sm={6}>
              <Card
                image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                title={'Mock Test'}
                subTitle={''}
              />
            </Col>
            <Col lg={3} sm={6}>
              <Card
                image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                title={'Previous Year Test'}
                subTitle={''}
                color={'type2'}
              />
            </Col>
            <Col lg={3} sm={6}>
              <Card
                image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                title={'Unit Wise Test'}
                subTitle={''}
                color={'type3'}
              />
            </Col>
            <Col lg={3} sm={6}>
              <Card
                image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                title={'Unit Wise Test'}
                subTitle={''}
                color={'type4'}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Home;
