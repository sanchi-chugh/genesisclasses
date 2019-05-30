import React, { Component } from "react";
import { Button, 
         Modal,
         Grid,
         Row,
         Col, 
         Badge} 
         from "react-bootstrap";

class TestDetails extends Component {

  render() {
    console.log(this.props)

    return ( 
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                        TEST DETAILS
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Grid fluid>
                        <Row xs={12} style={{margin:12}}>
                          <b><Col md={4}>TITLE</Col></b>
                          <Col md={8}>{this.props.data.title === undefined ? '...' : this.props.data.title.toUpperCase() }</Col>
                        </Row>
                        <Row xs={12} style={{margin:12}}>
                          <b><Col md={4}>UNIT</Col></b>
                          <Col md={8}>{this.props.data.unit === undefined ? '...' : this.props.data.unit.toUpperCase() }</Col>
                        </Row>
                        <Row xs={12} style={{margin:12}}>
                          <b><Col md={4}>SUBJECT</Col></b>
                          <Col md={8}>{this.props.data.subject === undefined ? '...' : this.props.data.subject.toUpperCase() }</Col>
                        </Row>
                        <Row xs={12} style={{margin:12}}>
                          <b><Col md={4}>COURSES</Col></b>
                          <Col md={8}>{this.props.data.course === undefined ? '...' : this.props.data.course.map(item => {return (<Badge style={{marginRight:2}}>{item}</Badge>)})}</Col>
                        </Row>
                        <Row xs={12} style={{margin:12}}>
                          <b><Col md={4}>CATEGORIES</Col></b>
                          <Col md={8}>{this.props.data.category === undefined ? '...' : this.props.data.category.map(item => {return (<Badge style={{marginRight:2}}>{item}</Badge>)})}</Col>
                        </Row>
                    </Grid> 
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>OKAY</Button>
                </Modal.Footer>
        </Modal>
    );
  }
}

export default TestDetails;
