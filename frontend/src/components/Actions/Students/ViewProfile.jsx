import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  Badge
} from "react-bootstrap";

import { Card } from "../../../components/Card/Card.jsx";
import { UserCard } from "../../../components/UserCard/UserCard.jsx";

class ViewProfile extends Component {

  componentDidMount(){
    console.log(this.props.location.data)
  }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={8}>
              <Card
                title="Profile Information"
                content={
                  <Grid fluid>
                    <Row xs={8} style={{margin:12}}>
                      <b><Col md={3}>NAME</Col></b>
                      <Col md={5}>{this.props.location.data.first_name+' '+this.props.location.data.last_name}</Col>
                    </Row>
                    <Row xs={8} style={{margin:12}}>
                      <b><Col md={3}>EMAIL</Col></b>
                      <Col md={5}>{this.props.location.data.email}</Col>
                    </Row>
                    <Row xs={8} style={{margin:12}}>
                      <b><Col md={3}>CONTACT NUMBER</Col></b>
                      <Col md={5}>{this.props.location.data.contact_number}</Col>
                    </Row>
                    <Row xs={8} style={{margin:12}}>
                      <b><Col md={3}>CENTRE</Col></b>
                      <Col md={5}>{this.props.location.data.centre.location}</Col>
                    </Row>
                    <Row xs={8} style={{margin:12}}>
                      <b><Col md={3}>COURSES</Col></b>
                      <Col md={5}>{this.props.location.data.course.map(item => {return (<Badge style={{marginRight:2}}>{item.title}</Badge>)})}</Col>
                    </Row>
                    <Row xs={8} style={{margin:12}}>
                      <b><Col md={3}>GENDER</Col></b>
                      <Col md={5}>{this.props.location.data.gender === null ? '...' : this.props.location.data.gender }</Col>
                    </Row>
                    <Row xs={8} style={{margin:12}}>
                      <b><Col md={3}>FATHER'S NAME</Col></b>
                      <Col md={5}>{this.props.location.data.father_name === null ? '...' : this.props.location.data.father_name }</Col>
                    </Row>
                    <Row xs={8} style={{margin:12}}>
                      <b><Col md={3}>DATE OF BIRTH</Col></b>
                      <Col md={5}>{this.props.location.data.dateOfBirth === null ? '...' : this.props.location.data.dateOfBirth }</Col>
                    </Row>
                    <Row xs={8} style={{margin:12}}>
                      <b><Col md={3}>ADDRESS</Col></b>
                      <Col md={5}>{this.props.location.data.address === null ? '...' : this.props.location.data.address }</Col>
                    </Row>
                  </Grid>
                }
              />
            </Col>
            <Col md={4}>
              <UserCard
                bgImage="https://ununsplash.imgix.net/photo-1431578500526-4d9613015464?fit=crop&fm=jpg&h=300&q=75&w=400"
                avatar={this.props.location.data.image === null || this.props.location.data.image === "" ? "https://scc.rhul.ac.uk/files/2018/06/placeholder.png" : this.props.location.data.image}
                name={this.props.location.data.first_name + ' ' + this.props.location.data.last_name}
                userName={this.props.location.data.email}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default ViewProfile;
