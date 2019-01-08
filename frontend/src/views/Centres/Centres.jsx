import React, { Component } from "react";
import { Grid, Row, Col, Table } from "react-bootstrap";
import axios from 'axios';

import Card from "../../components/Card/Card.jsx";
import Tables from "../../components/Table/Table";

class Centres extends Component {

    constructor() {
        super();
        this.state = {
          data: [],
        };
      }

  componentDidMount() {
    axios.get("/api/centres/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        console.log(res.data);
        const data = res.data;
        this.setState({data});
    });
  }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Centres"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <Tables data={this.state.data}/>
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Centres;
