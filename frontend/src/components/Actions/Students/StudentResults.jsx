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
import TestDetails from './TestDetails';

class StudentResults extends Component {

  constructor() {
    super();
    this.state = {
      data:{results:[]},
      busy:true,
      page: 1,
      show:false,
      search:false,
      searchString:'',
      testDetails: {}
    };
  }

  componentDidMount(){
    this.fetchResults('?page=1');
  }

  fetchResults(page, index=0){
    var searchString='';
    if(page===`?page=1`){
        page="";
        if(this.state.search){
          searchString = '?search='+this.state.searchString;
        }
    }else{
      if(this.state.search){
        searchString = '&search='+this.state.searchString;
      }
    }
    axios.get(`/api/results/students/${this.props.match.params.id}/${page}${searchString}`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const results = res.data.results.map(item => {
          item.sno = res.data.results.indexOf(item) + 1+index;
          return item;
        })
        res.data.results = results
        const data = res.data
        this.setState({
         data: data,
         busy: false 
      });
    });
  }

  onPageChange(page, sizePerPage=10) {
    const currentIndex = (page - 1) * sizePerPage;
    this.fetchResults(`?page=${page}`,currentIndex);
    console.log(currentIndex,page,sizePerPage,this.state.data);
    this.setState({
      page: page,
    });
  }

  handleSearchChange(string){
    console.log(string)
    if(string.trim() !== ''){
      this.setState({
        search:true,
        searchString:string.trim(),
        page:1
      },()=>{
        this.fetchResults(`?page=1`);
      })
    }else{
      this.setState({
        search:false,
        searchString:'',
        page:1
      },()=>{
        this.fetchResults(`?page=1`);
      })
    }
  }

  handleHide(){
    this.setState({show:false})
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
                <Button style={{width:'130px'}} bsSize="small" bsStyle="info" onClick={()=>{this.setState({show:true, testDetails:cell})}}>
                  <Glyphicon glyph="edit" /> View Test Info
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
          <Col md={12}>
            <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" bsStyle="warning" onClick={()=>{this.props.history.push(`/students/results/1/test/${cell.id}`)}}>
                  <Glyphicon glyph="stats" /> Sectional Results
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
                title="Student Results"
                content={
                  <Grid fluid>
                    <div>
                        <BootstrapTable
                          condensed pagination
                          data={this.state.data.results}
                          search remote
                          fetchInfo={ { dataTotalSize: this.state.data.count } }
                          options={ { sizePerPage: 10,
                                      onSearchChange: this.handleSearchChange.bind(this), searchDelayTime: 2000,
                                      onPageChange: this.onPageChange.bind(this),
                                      sizePerPageList: [ 10 ],
                                      page: this.state.page} }>
                            <TableHeaderColumn width={40} dataField='sno' isKey hiddenOnInsert>SNo</TableHeaderColumn>
                            <TableHeaderColumn dataField='test' dataFormat={this.renderTitle.bind(this)}>Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='testAttemptDate'>Date</TableHeaderColumn>
                            <TableHeaderColumn dataField='percentage'>Percentage</TableHeaderColumn>
                            <TableHeaderColumn dataField='marksObtained'>Total Marks</TableHeaderColumn>
                            <TableHeaderColumn dataField='marksObtained'>Marks Obtained</TableHeaderColumn>
                            <TableHeaderColumn dataField='correct'>Total Questions</TableHeaderColumn>
                            <TableHeaderColumn dataField='correct'>Correct</TableHeaderColumn>
                            <TableHeaderColumn dataField='incorrect'>Incorrect</TableHeaderColumn>
                            <TableHeaderColumn dataField='unattempted'>Unattempted</TableHeaderColumn>
                            <TableHeaderColumn width={190} dataField='test' dataFormat={this.renderColumn.bind(this)}>Action</TableHeaderColumn>
                        </BootstrapTable>
                      </div>
                      <TestDetails
                        show={this.state.show}
                        onHide={this.handleHide.bind(this)}
                        data={this.state.testDetails}
                      />
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

export default StudentResults;
