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

import renderHTML from 'react-render-html';
import { Card } from "../../../components/Card/Card.jsx";
import { UserCard } from "../../../components/UserCard/UserCard.jsx";
import axios from 'axios';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import TestDetails from './TestDetails';

class QuestionWiseResults extends Component {

  constructor() {
    super();
    this.state = {
      data:{results:[]},
      busy:true,
      page: 1,
      search:false,
      searchString:''
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
    axios.get(`/api/results/students/${this.props.match.params.id}/tests/sections/${this.props.match.params.section}/${page}${searchString}`, {
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

  renderType(cell, row, enumObject, rowIndex){
    return (
        <div style={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
          {cell.questionType}
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
                <Button bsSize="small" bsStyle="info" onClick={()=>{this.props.history.push(`/tests/sections/questions/detail/${cell.id}`)}}>
                  <Glyphicon glyph="stats" /> View Question Details
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Grid>
      </div>
    )
  }

  renderQuestion(cell, row, enumObject, rowIndex) {
    return (
        <div style={{width:380,wordWrap:'break-word',wordBreak:'normal',whiteSpace:'normal'}}>{renderHTML(cell.questionText)}</div>
    )
  }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Question Wise Results"
                content={
                  <Grid fluid>
                    <div>
                        <BootstrapTable
                          condensed pagination
                          data={this.state.data.results}
                          search remote
                          fetchInfo={ { dataTotalSize: this.state.data.count } }
                          options={ { sizePerPage: 10,
                                      onPageChange: this.onPageChange.bind(this),
                                      onSearchChange: this.handleSearchChange.bind(this),
                                      sizePerPageList: [ 10 ],
                                      page: this.state.page} }>
                            <TableHeaderColumn width={40} dataField='sno' isKey hiddenOnInsert>SNo</TableHeaderColumn>
                            <TableHeaderColumn width={400} dataField='question' dataFormat={this.renderQuestion.bind(this)}>Question</TableHeaderColumn>
                            <TableHeaderColumn dataField='question' dataFormat={this.renderType.bind(this)}>Type</TableHeaderColumn>
                            <TableHeaderColumn dataField='marksAwarded'>Marks Awarded</TableHeaderColumn>
                            <TableHeaderColumn dataField='isMarkedForReview'>Marked For Review</TableHeaderColumn>
                            <TableHeaderColumn dataField='status'>Status</TableHeaderColumn>
                            <TableHeaderColumn width={224} dataField='question' dataFormat={this.renderColumn.bind(this)}>Action</TableHeaderColumn>
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

export default QuestionWiseResults;
