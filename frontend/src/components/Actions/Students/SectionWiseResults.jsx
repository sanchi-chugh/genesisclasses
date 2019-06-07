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

  renderNumber(cell, row, enumObject, rowIndex, key){
    return (
        <div style={{whiteSpace: 'normal'}}>
          {cell.totalQuestions}
        </div>
      )
  }

  renderMarks(cell, row, enumObject, rowIndex, key){
    return (
        <div style={{whiteSpace: 'normal'}}>
          {cell.totalMarks}
        </div>
      )
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
                    <div style={{display: 'block', whiteSpace:'normal', marginBottom:'20px'}}>
                      <div style={{display: 'inline-block', paddingInlineEnd:'8px', width:'220px'}}>
                        <b> TM:- </b> Total Marks
                      </div>
                      <div style={{display: 'inline-block', paddingInlineEnd:'8px', width:'220px'}}>
                        <b> TQ:- </b> Total Questions
                      </div>
                      <div style={{display: 'inline-block', paddingInlineEnd:'8px', width:'220px'}}>
                        <b> MO:- </b> Marks Obtained
                      </div>
                      <div style={{display: 'inline-block', paddingInlineEnd:'8px', width:'220px'}}>
                        <b> %age:- </b>  Percentage
                      </div>
                      <div style={{display: 'inline-block', paddingInlineEnd:'8px', width:'220px'}}>
                        <b> CQ:- </b>  Correct Questions
                      </div>
                      <div style={{display: 'inline-block', paddingInlineEnd:'8px', width:'220px'}}>
                        <b> IQ:- </b>  Incorrect Questions
                      </div>
                      <div style={{display: 'inline-block', paddingInlineEnd:'8px', width:'280px'}}>
                        <b> UAQ:- </b> Unattempted Questions
                      </div>
                    </div>
                    <div>
                        <BootstrapTable
                          condensed pagination
                          data={this.state.data}
                          search>
                            <TableHeaderColumn width={40} dataField='sno' isKey hiddenOnInsert>SNo</TableHeaderColumn>
                            <TableHeaderColumn width={180} dataField='section' dataFormat={this.renderTitle.bind(this)}>Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='percentage'>%age</TableHeaderColumn>
                            <TableHeaderColumn dataField='section' dataFormat={this.renderMarks.bind(this)}>TM</TableHeaderColumn>
                            <TableHeaderColumn dataField='marksObtained'>MO</TableHeaderColumn>
                            <TableHeaderColumn dataField='section' dataFormat={this.renderNumber.bind(this)}>TQ</TableHeaderColumn>
                            <TableHeaderColumn dataField='correct'>CQ</TableHeaderColumn>
                            <TableHeaderColumn dataField='incorrect'>IQ</TableHeaderColumn>
                            <TableHeaderColumn dataField='unattempted'>UAQ</TableHeaderColumn>
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
