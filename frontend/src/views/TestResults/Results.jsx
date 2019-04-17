import React, { Component } from "react";
import { Glyphicon, Grid, Row, Col } from "react-bootstrap";
import renderHTML from 'react-render-html';

class Results extends Component {

  render() {
    return (
      <div className="test-results">
        <Grid fluid>
          <Row>
            <Col md={4}>
              <div className="results-card">
              </div>
            </Col>
            <Col md={4}>
              <div className="results-card">
              </div>
            </Col>
            <Col md={4}>
              <div className="results-card">
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <div className="results-card">
              </div>
            </Col>
            <Col md={8}>
              <div className="results-card-big">
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Results;
