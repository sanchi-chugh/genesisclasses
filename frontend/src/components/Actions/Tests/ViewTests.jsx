import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  Badge
} from "react-bootstrap";

import { Card } from "../../../components/Card/Card.jsx";

class ViewTest extends Component {

  componentDidMount(){
    console.log(this.props.location.data)
  }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Test Information"
                content={
                  <Grid fluid>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>TITLE</Col></b>
                      <Col md={8}>{this.props.location.data.title === null ? '...' : this.props.location.data.title.toUpperCase() } {this.props.location.data.active ? '(ACTIVE)' : '(INACTIVE)'}</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>DESCRIPTION</Col></b>
                      <Col md={8}>{this.props.location.data.description === null ? '...' : this.props.location.data.description.toUpperCase() }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>DURATION</Col></b>
                      <Col md={8}>{this.props.location.data.duration === null ? '...' : this.props.location.data.duration.toUpperCase() }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>TYPE OF TEST</Col></b>
                      <Col md={8}>{this.props.location.data.typeOfTest === null ? '...' : this.props.location.data.typeOfTest.toUpperCase() }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>INSTRUCTION</Col></b>
                      <Col md={8}>{this.props.location.data.instructions === null ? '...' : this.props.location.data.instructions.toUpperCase() }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>TOTAL MARKS</Col></b>
                      <Col md={8}>{this.props.location.data.totalMarks === null ? '...' : this.props.location.data.totalMarks }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>TOTAL QUESTIONS</Col></b>
                      <Col md={8}>{this.props.location.data.totalQuestions === null ? '...' : this.props.location.data.totalQuestions }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>START TIME</Col></b>
                      <Col md={8}>{this.props.location.data.startTime === null ? '...' : this.props.location.data.startTime.toUpperCase() }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>END TIME</Col></b>
                      <Col md={8}>{this.props.location.data.endtime === null ? '...' : this.props.location.data.endtime.toUpperCase() }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>UNIT</Col></b>
                      <Col md={8}>{this.props.location.data.unit === null ? '...' : this.props.location.data.unit.title.toUpperCase() }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>SUBJECT</Col></b>
                      <Col md={8}>{this.props.location.data.subject === null ? '...' : this.props.location.data.subject.title.toUpperCase() }</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>COURSES</Col></b>
                      <Col md={8}>{this.props.location.data.course === null ? '...' : this.props.location.data.course.map(item => {return (<Badge style={{marginRight:2}}>{item.title}</Badge>)})}</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>CATEGORIES</Col></b>
                      <Col md={8}>{this.props.location.data.category === null ? '...' : this.props.location.data.category.map(item => {return (<Badge style={{marginRight:2}}>{item.title}</Badge>)})}</Col>
                    </Row>
                    <Row xs={12} style={{margin:12}}>
                      <b><Col md={4}>DOCUMENT</Col></b>
                      <Col md={8}>{this.props.location.data.doc === null ? '...' :  <a href={this.props.location.data.doc} target='_blank'>TEST DOCUMENT</a>} </Col>
                    </Row>
                  </Grid>
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default ViewTest;
