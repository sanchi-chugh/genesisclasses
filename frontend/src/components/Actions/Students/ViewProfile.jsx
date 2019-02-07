import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
} from "react-bootstrap";

import { Card } from "../../../components/Card/Card.jsx";
import { UserCard } from "../../../components/UserCard/UserCard.jsx";

class ViewProfile extends Component {
  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={8}>
              <Card
                title="Profile Information"
                content={
                  <Grid>
                    <Row xs={8} style={{margin:8}}>
                      <b><Col md={3}>NAME</Col></b>
                      <Col md={5}>MOHIT NAGPAL</Col>
                    </Row>
                    <Row xs={8} style={{margin:8}}>
                      <b><Col md={3}>AGE</Col></b>
                      <Col md={5}>23</Col>
                    </Row>
                    <Row xs={8} style={{margin:8}}>
                      <b><Col md={3}>FATHER'S NAME</Col></b>
                      <Col md={5}>JASWANT NAGPAL</Col>
                    </Row>
                    <Row xs={8} style={{margin:8}}>
                      <b><Col md={3}>ADDRESS</Col></b>
                      <Col md={5}>CHANDIGARH</Col>
                    </Row>
                    <Row xs={8} style={{margin:8}}>
                      <b><Col md={3}>NAME</Col></b>
                      <Col md={5}>MOHIT NAGPAL</Col>
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
        </Grid>>
      </div>
    );
  }
}

export default ViewProfile;
