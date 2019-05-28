import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  Badge
} from "react-bootstrap";

import { Card } from "../../../components/Card/Card.jsx";
import { UserCard } from "../../../components/UserCard/UserCard.jsx";
import axios from 'axios';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

class StudentResults extends Component {

  constructor() {
    super();
    this.state = {
      data:{results:[]},
      busy:true,
      page: 1,
    };
  }

  componentDidMount(){
    this.fetchResults('?page=1');
  }

  fetchResults(page, index=0){
    if(page==='?page=1'){
      page=''
    }
    axios.get(`/api/results/students/${this.props.match.params.id}/${page}`, {
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

  renderTitle(cell, row, enumObject, rowIndex){
    return (
        <div style={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
          {cell.title}
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

export default StudentResults;
