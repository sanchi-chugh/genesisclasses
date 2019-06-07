import React, { Component } from "react";
import { Grid, 
         Row, 
         Col, 
         ButtonToolbar, 
         ButtonGroup, 
         Button, 
         Glyphicon, 
         Badge
} from "react-bootstrap";
import axios from 'axios';
import moment from 'moment';

import Card from "../../components/Card/Card.jsx";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import AddBulkStudents from "../../components/Actions/BulkStudents/AddBulkStudents";

class BulkStudents extends Component {

    constructor() {
        super();
        this.handleFormDataChange = this.handleFormDataChange.bind(this);
        this.state = {
          data: [],
          show:false,//add modal
          courses:[],
          centres:[],
          centreName:'Select Centre',
          centreId:'',
          numberOfStudents: '',
          formData:{
            number:'',
            course:[],
            endAccessDate:'',
            joiningDate:moment(new Date()).format("YYYY-MM-DD"),
            location:''
          },
          id:null,
          subject:null,
          bulkAdded:false,
          addingBulk:false,
          page:1,
          errors: {},
          search:false,
          searchString:''
        };
      }
  
  componentWillMount() {
   this.fetchBulkStudents(`?page=1`);
   this.fetchCourses();
   this.fetchCentres();
   console.log(this.state)
  }

  fetchBulkStudents(page,index=0,url=null){
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
    axios.get(`/api/users/students/bulk/${page}${searchString}`, {
        headers: {
        Authorization: `Token ${localStorage.token}`,
        }
    }).then(res => {
          const results = res.data.results.map(item => {
          item.sno = res.data.results.indexOf(item) + 1+index;
          return item;
        })
        res.data.results = results
        const data = res.data
        this.setState({data:data});
    });
  }

  fetchCentres(){
    axios.get("/api/centres/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        this.setState({centres:data});
    });
  }

  fetchCourses(){
    axios.get("/api/courses/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        this.setState({courses:data});
    });
  }

  handleHideAddModal() {
    this.setState({ 
      show: false, 
      addingBulk:false, 
      bulkAdded:false,
      formData:{
        number:'',
        course:[],
      },
      centreId:'',
      centreName:'Select Centre',
      errors: {}
    });
  }

  handleShowAddModal(){
    this.setState({show:true})
  }

  handleSelect(item){
    this.setState({centreName:item.location, centreId:item.id})
  }

  handleAdd(e){
    e.preventDefault();
    this.setState({ addingBulk: true }, () => {
      var formData = new FormData();
      formData.append('number',this.state.formData.number)
      formData.append('course',this.state.formData.course.join(','))
      formData.append('centre',this.state.formData.location)
      formData.append('endAccessDate', this.state.formData.endAccessDate )
      formData.append('joiningDate', this.state.formData.joiningDate )
      axios.post('/api/users/students/bulk/create/', formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState({ addingBulk: false, bulkAdded:true }, ()=>{
        this.fetchBulkStudents(`?page=1`);
        this.props.handleClick('tr','Added Successfully');
        this.handleHideAddModal();
      }))
      .catch((err) => this.setState({ addingBulk: false, errors: err.response.data }, () => console.log(err)))
    });
  }

  handleFormDataChange(e) {
    if(e.target.name === 'course' ){
        if(e.target.checked){
          this.state.formData.course.push(e.target.value)
        }else{
          this.setState({
            formData:{
              ...this.state.formData,
              course:this.state.formData.course.filter( (item) => {
                if(item !== e.target.value){
                  return item
                }
              })
            }
          })
        }
    }else{
      this.setState({ formData: {
        ...this.state.formData,
        [e.target.name] : e.target.value.trimLeft()
    }});
    }
  }

  downloadCSV(obj){
    window.open(obj.csv_file, '_blank');
  }
  
  renderColumn(cell, row, enumObject, rowIndex) {
    return (
      <div>
        <Grid> 
          <Col>
            <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" bsStyle="primary" onClick={this.downloadCSV.bind(this,row)}>
                  <Glyphicon glyph="list-alt" /> DOWNLOAD CSV
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Grid>
      </div>
    )
  }

  renderCourses(cell, row, enumObject, rowIndex) {
      return (
        <div className="courseCell">
          {
          row.course.map((item)=>{
            return(
              <div className="courseBadge"><Badge>{item}</Badge></div>
            )
        })}   
        </div>
      )
    }

  handleSearchChange(string){
    console.log(string)
    if(string.trim() !== ''){
      this.setState({
        search:true,
        searchString:string.trim(),
        page:1
      },()=>{
        this.fetchBulkStudents(`?page=1`);
      })
    }else{
      this.setState({
        search:false,
        searchString:'',
        page:1
      },()=>{
        this.fetchBulkStudents(`?page=1`);
      })
    }
  }

  onPageChange(page, sizePerPage) {
    const currentIndex = (page - 1) * sizePerPage;
    this.fetchBulkStudents(`?page=${page}`,currentIndex)
    console.log(currentIndex,page,sizePerPage,this.state.data)
    this.setState({
      page: page,
    });
  }

  render() {
    return (
      <div className="content modal-container">
        <Grid fluid>
          <Row>
            <Col>
              <Card
                title="BulkStudents"
                addButton={true}
                handleShowAddModal={this.handleShowAddModal.bind(this)}
                ctTableFullWidth
                ctTableResponsive
                content={
                  <div style={{margin:10}}>
                    <BootstrapTable
                      condensed pagination
                      data={this.state.data.results}
                      remote search
                      fetchInfo={ { dataTotalSize: this.state.data.count } }
                      options={{ sizePerPage: 10,
                                  onPageChange: this.onPageChange.bind(this),
                                  onSearchChange: this.handleSearchChange.bind(this),
                                  sizePerPageList: [ 5, 10 ],
                                  page: this.state.page
                              }}>
                        <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='centre'>Centre</TableHeaderColumn>
                        <TableHeaderColumn dataField='number'>Number Of Students</TableHeaderColumn>
                        <TableHeaderColumn dataField='creationDateTime'>Created On</TableHeaderColumn>
                        <TableHeaderColumn dataField='endAccessDate'>Access Date</TableHeaderColumn>
                        <TableHeaderColumn dataField='courses' dataFormat={this.renderCourses.bind(this)}>Courses</TableHeaderColumn>
                        <TableHeaderColumn dataField='csv_file' dataFormat={this.renderColumn.bind(this)}>CSV</TableHeaderColumn>
                    </BootstrapTable>
                  </div>
                }
              />
              <AddBulkStudents
                show={this.state.show}
                onHide={this.handleHideAddModal.bind(this)}
                bulkAdded={this.state.bulkAdded}
                addingBulk={this.state.addingBulk}
                handleAdd={this.handleAdd.bind(this)}
                formData={this.state.formData}
                courses={this.state.courses}
                centres={this.state.centres}
                centreName={this.state.centreName}
                handleFormDataChange={this.handleFormDataChange.bind(this)}
                handleSelect={this.handleSelect.bind(this)}
                errors={this.state.errors}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default BulkStudents;
