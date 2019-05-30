import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  Badge,
  ButtonToolbar,
  ButtonGroup,
  Glyphicon,
  Button
} from "react-bootstrap";

import { Card } from "../../../components/Card/Card.jsx";
import { UserCard } from "../../../components/UserCard/UserCard.jsx";
import axios from 'axios';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

class SectionWiseResults extends Component {

  constructor() {
    super();
    this.state = {
      data:[],
      busy:true,
    };
  }

  componentDidMount(){
    this.fetchResults();
  }

  fetchResults(){
    axios.get(`/api/results/students/${this.props.match.params.id}/tests/${this.props.match.params.test}/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        console.log(res.data)
        const data = res.data.map(obj => {
          obj.sno = res.data.indexOf(obj) + 1;
          return obj;
        })
        this.setState({
         data: data,
         busy: false 
      });
    });
  }

  renderTitle(cell, row, enumObject, rowIndex){
    return (
        <div style={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
          {cell.title}
        </div>
      )
  }

  renderColumn(cell, row, enumObject, rowIndex) {
    return (
      <div>
        <Grid> 
          <Col md={12}>
            <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" bsStyle="warning" onClick={()=>{this.props.history.push(`/students/results/1/test/sections/${cell.id}`)}}>
                  <Glyphicon glyph="stats" /> Question Results
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Grid>
      </div>
    )
  }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Section Wise Results"
                content={
                  <Grid fluid>
                    <div>
                        <BootstrapTable
                          condensed pagination
                          data={this.state.data}
                          search>
                            <TableHeaderColumn width={40} dataField='sno' isKey hiddenOnInsert>SNo</TableHeaderColumn>
                            <TableHeaderColumn dataField='section' dataFormat={this.renderTitle.bind(this)}>Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='percentage'>Percentage</TableHeaderColumn>
                            <TableHeaderColumn dataField='marksObtained'>Total Marks</TableHeaderColumn>
                            <TableHeaderColumn dataField='marksObtained'>Marks Obtained</TableHeaderColumn>
                            <TableHeaderColumn dataField='correct'>Total Questions</TableHeaderColumn>
                            <TableHeaderColumn dataField='correct'>Correct</TableHeaderColumn>
                            <TableHeaderColumn dataField='incorrect'>Incorrect</TableHeaderColumn>
                            <TableHeaderColumn dataField='unattempted'>Unattempted</TableHeaderColumn>
                            <TableHeaderColumn width={190} dataField='section' dataFormat={this.renderColumn.bind(this)}>Action</TableHeaderColumn>
                        </BootstrapTable>
                      </div>
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

export default SectionWiseResults;
