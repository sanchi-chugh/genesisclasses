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
import { FormInputs } from "../../../components/FormInputs/FormInputs.jsx";

import { Card } from "../../../components/Card/Card.jsx";

class TestResults extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      busy:true,
      centres:[],
      results:[],
      formData:{
        centre:null,
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

  handleViewResults(e){
    e.preventDefault();
    axios.get(`/api/results/tests/${this.props.match.params.id}/?start_date=${this.state.formData.start_date}&end_date=${this.state.formData.end_date}&centre=${this.state.formData.centre}`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data.results;
        console.log(data)
        this.setState({
         results: data,
      });
    });
  }

  handleFormDataChange(e) {
    this.setState({ formData: {
      ...this.state.formData,
      [e.target.name] : e.target.value.trimLeft()
    }});
  }

  render() {
    if(this.state.busy){
      return <div></div>;
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
                    <form onSubmit={(event)=>this.handleViewResults(event)}>
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
                    <p>Bar Graph</p>
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
