import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  Badge,
  FormControl,
  FormGroup,
  HelpBlock,
  ControlLabel,
} from "react-bootstrap";

import axios from 'axios';
import Button from "../../../components/CustomButton/CustomButton.jsx";
import LinearProgress from '@material-ui/core/LinearProgress';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { VictoryStack, VictoryChart, VictoryGroup, VictoryBar } from 'victory';
import { FormInputs } from "../../../components/FormInputs/FormInputs.jsx";

import { Card } from "../../../components/Card/Card.jsx";

class TestResults extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      busy:true,
      flag: false,
      page: 1,
      centres:[],
      results:{results:[]},
      formData:{
        centre:0,
        start_date:null,
        end_date:null
      }
    };
  }

  componentDidMount(){
    this.fetchCentres();
    this.fetchGraph();
  }

  fetchGraph(){
    axios.get(`/api/results/tests/graph/${this.props.match.params.id}/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data.details;
        console.log(data);
        this.setState({
         data: data,
         busy: false 
      });
    });
  }

  fetchCentres(){
    axios.get(`/api/centres/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        console.log(data)
        this.setState({
         centres: data,
      });
    });
  }

  handleViewResults(e=null, page,index=0){
    if(e!== null){
      e.preventDefault();
    }
    if(page===`/?page=1`){
        page=""
    }
    axios.get(`/api/results/tests/${this.props.match.params.id}/?start_date=${this.state.formData.start_date}&end_date=${this.state.formData.end_date}&centre=${this.state.formData.centre}${page}`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        console.log(data)
        this.setState({
         results: data,
         flag: data.results.length > 0,
      });
    });
  }

  onPageChange(page, sizePerPage=10) {
    const currentIndex = (page - 1) * sizePerPage;
    this.handleViewResults(null, `/?page=${page}`,currentIndex);
    console.log(currentIndex,page,sizePerPage,this.state.data);
    this.setState({
      page: page,
    });
  }

  handleFormDataChange(e) {
    this.setState({ formData: {
      ...this.state.formData,
      [e.target.name] : e.target.value.trimLeft()
    }});
  }

  renderTitle(cell, row, enumObject, rowIndex){
    return (
        <div style={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
          {cell.name}
        </div>
      )
  }

  render() {
    const getBarData = () => {
      return [1, 2, 3].map(() => {
        return [
          { x: 2001, y: Math.random() },
          { x: 2002, y: Math.random() },
          { x: 2003, y: Math.random() }
        ];
      });
    };
    if(this.state.busy){
      return <div className="loader"></div>;
    }
    if(this.state.flag){
      return(
          <div className="content">
            <Grid fluid>
              <Row>
                <Col md={12}>
                  <Card
                    title="View Results"
                    content={
                      <Grid fluid>
                        <form onSubmit={(event)=>this.handleViewResults(event,'/?page=1')}>
                          <FormInputs
                            ncols={["col-md-12"]}
                            proprieties={[
                              {
                                label: "Start Date *",
                                type: "date",
                                bsClass: "form-control",
                                name:'start_date',
                                value:this.state.formData.start_date,
                                // errors: errors,
                                onChange:this.handleFormDataChange.bind(this)
                              },
                            ]}
                          />
                          <FormInputs
                            ncols={["col-md-12"]}
                            proprieties={[
                              {
                                label: "End Date *",
                                type: "date",
                                bsClass: "form-control",
                                name:'end_date',
                                value:this.state.formData.end_date,
                                // errors: errors,
                                onChange:this.handleFormDataChange.bind(this)
                              },
                            ]}
                          />
                            <FormGroup>
                              <ControlLabel className='form-input'>Centre * </ControlLabel>
                              <FormControl 
                                componentClass="select" 
                                value={this.state.formData.centre} 
                                onChange={this.handleFormDataChange.bind(this)} 
                                name="centre">
                                  <option value='0'>All Centres</option>
                                  { this.state.centres.map(item =>{
                                    return(
                                      <option value={item.id}>{item.location}</option>
                                    )
                                  })}
                              </FormControl>  
                              {
                              //   Object.keys(errors)
                              //           .some(item=> item === "centre") && 
                              //               errors.centre.map(err=>
                              //                   <HelpBlock>{err}</HelpBlock>
                              //               )
                              }
                            </FormGroup>
                          <LinearProgress
                              style={
                                  this.state.loadingResults ? 
                                  {visibility: 'visible',marginBottom:10} :
                                  {visibility: 'hidden'}
                                  }
                              color="primary"
                              />
                          <Button bsStyle="warning" pullRight fill type="submit">
                            View Results
                          </Button>
                        <div className="clearfix" />
                      </form>
                      <div style={{marginTop:50}}>
                        <BootstrapTable
                          condensed pagination
                          data={this.state.results.results}
                          search remote
                          fetchInfo={ { dataTotalSize: this.state.results.count } }
                          options={ { sizePerPage: 10,
                                      onPageChange: this.onPageChange.bind(this),
                                      sizePerPageList: [ 10 ],
                                      page: this.state.page} }>
                            <TableHeaderColumn width={40} dataField='rank' isKey hiddenOnInsert>Rank</TableHeaderColumn>
                            <TableHeaderColumn dataField='student' dataFormat={this.renderTitle.bind(this)}>Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='testAttemptDate'>Date</TableHeaderColumn>
                            <TableHeaderColumn dataField='percentile'>Percentile</TableHeaderColumn>
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
        )
    }
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={4}>
              <Card
                title="View Results"
                content={
                  <Grid fluid>
                    <form onSubmit={(event)=>this.handleViewResults(event, '/?page=1')}>
                      <FormInputs
                        ncols={["col-md-12"]}
                        proprieties={[
                          {
                            label: "Start Date *",
                            type: "date",
                            bsClass: "form-control",
                            name:'start_date',
                            value:this.state.formData.start_date,
                            // errors: errors,
                            onChange:this.handleFormDataChange.bind(this)
                          },
                        ]}
                      />
                      <FormInputs
                        ncols={["col-md-12"]}
                        proprieties={[
                          {
                            label: "End Date *",
                            type: "date",
                            bsClass: "form-control",
                            name:'end_date',
                            value:this.state.formData.end_date,
                            // errors: errors,
                            onChange:this.handleFormDataChange.bind(this)
                          },
                        ]}
                      />
                        <FormGroup>
                          <ControlLabel className='form-input'>Centre * </ControlLabel>
                          <FormControl 
                            componentClass="select" 
                            value={this.state.formData.centre} 
                            onChange={this.handleFormDataChange.bind(this)} 
                            name="centre">
                              <option value='0'>All Centres</option>
                              { this.state.centres.map(item =>{
                                return(
                                  <option value={item.id}>{item.location}</option>
                                )
                              })}
                          </FormControl>  
                          {
                          //   Object.keys(errors)
                          //           .some(item=> item === "centre") && 
                          //               errors.centre.map(err=>
                          //                   <HelpBlock>{err}</HelpBlock>
                          //               )
                          }
                        </FormGroup>
                      <LinearProgress
                          style={
                              this.state.loadingResults ? 
                              {visibility: 'visible',marginBottom:10} :
                              {visibility: 'hidden'}
                              }
                          color="primary"
                          />
                      <Button bsStyle="warning" pullRight fill type="submit">
                        View Results
                      </Button>
                    <div className="clearfix" />
                  </form>
                  </Grid>
                }
              />
            </Col>
            <Col md={8}>
              <Card
                title="Test Results"
                content={
                  <Grid fluid>
                    <div>
                      <VictoryChart 
                        domainPadding={{ x: 50 }} 
                        width={400} 
                        height={400}
                        >
                          <VictoryGroup offset={20} style={{ data: { width: 15 } }}>
                            <VictoryStack  colorScale={["red", "#e5cd47", "green"]}>
                              {getBarData().map((data, index) => {
                                return <VictoryBar
                                           key={index}
                                           data={data}
                                           />;
                              })}
                            </VictoryStack>
                            <VictoryStack  colorScale={["red", "#e5cd47", "green"]}>
                              {getBarData().map((data, index) => {
                                return <VictoryBar
                                           key={index}
                                           data={data}
                                           />;
                              })}
                            </VictoryStack>
                            <VictoryStack  colorScale={["red", "#e5cd47", "green"]}>
                              {getBarData().map((data, index) => {
                                return <VictoryBar
                                           key={index}
                                           data={data}
                                           />;
                              })}
                            </VictoryStack>
                          </VictoryGroup>
                        </VictoryChart>
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

export default TestResults;
