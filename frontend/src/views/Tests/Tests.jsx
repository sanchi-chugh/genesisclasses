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

import Card from "../../components/Card/Card.jsx";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import DeleteTest from "../../components/Actions/Tests/DeleteTests";
// import DeleteTest from "../../components/Actions/Tests/DeleteTests";
// import AddTests from "../../components/Actions/Tests/AddTests";
// import EditTest from "../../components/Actions/Tests/EditTests";

class Tests extends Component {

    constructor() {
        super();
        this.handleFormDataChange = this.handleFormDataChange.bind(this);
        this.state = {
          data: {results:[]},
          show: false,//edit modal
          show2:false,//delete modal
          show3:false,//add modal
          formData:{
            title:'',
            description:'',
            image:'',
            file:null,
            subject: ''
          },
          testChoice:[],
          value: '',
          id:null,
          updatingTest:false,
          testUpdated:false,
          testDeleted:false,
          deletingTest:false,
          transferData:false,
          transferTo:'Select Test',
          test:null,
          tests:[],
          testAdded:false,
          addingTest:false,
          clear:false,
          page:1,
          subjects:[],
          subject: 'Select Subject',
          next:'',
          dropdown:false
        };
      }
  
  componentWillMount() {
   this.fetchTests(`?page=1`);
   this.fetchSubjectsChoice();  
  }
  
  fetchMore(){
    axios.get(this.state.next, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data.results;
        this.setState({
          ...this.state,
          subjects: [...this.state.subjects,...data],
          next:res.data.next});
    });
  }

  fetchSubjectsChoice(){
    axios.get("/api/subjectChoice/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data.results;
        this.setState({subjects:data,
                       next:res.data.next});
    });
  }
  
  fetchTests(page,index=0){
    if(page===`?page=1`){
        page=""
    }
    axios.get( `/api/tests/${page}`, {
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
        this.setState({data:data});
    });
  }

  handleHideEditModal() {
    this.setState({ show: false, updatingTest:false, testUpdated:false, value:'',clear:false});
  }

  handleHideAddModal() {
    this.setState({ 
      show3: false, 
      addingTest:false, 
      testAdded:false,
      subject:'Select Subject',
      formData:{
        title:'',
        description:'',
        file:null,
        image:'',
        subject:''
    }});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingTest:false, testDeleted:false});
  }

  handleAdd(){
    this.setState({ addingTest: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('subject',this.state.formData.subject)
      formData.append('description',this.state.formData.description)
      if(this.state.formData.file !== null){
        formData.append('image',this.state.formData.file,this.state.formData.file.name)
      }else{
        formData.append('image','')
      }
      axios.post('/api/tests/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState({ addingTest: false, testAdded:true }, this.fetchTests(`?page=1`), this.fetchSubjectsChoice()))
      .catch((err) => this.setState({ addingTest: false }, () => console.log(err)))
    });
  }

  handleDelete = () => {
    this.setState({ deletingTest: true }, () => {
      axios.delete(`/api/tests/delete/${this.state.id}/`,{
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {
        this.setState({ deletingTest: false,testDeleted:true},this.fetchTests(`?page=${this.state.page}`,(this.state.page-1)*10))
      })
      .catch((err) => this.setState({ deletingTest: false }, () => console.log(err)))
    });
  }

  handleEdit() {
    this.setState({ updatingTest: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('subject',this.state.formData.subject)
      formData.append('description',this.state.formData.description)
      this.state.clear ? formData.append('image','') : (this.state.formData.file !== null ? formData.append('image',this.state.formData.file,this.state.formData.file.name) : console.log("debug") )
      axios.patch(`/api/tests/edit/${this.state.id}/`, formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingTest: false, testUpdated:true },this.fetchTests(`?page=1`), this.fetchSubjectsChoice());})
      .catch((err) => this.setState({ updatingTest: false }, () => console.log(err)))
    });
  }

  handleShowEditModal(obj){
    console.log(obj.subject.id)
    console.log(this.state.subjects.filter(item=> obj.subject.id===item.id)[0].title)
    this.setState({ id: obj.id ,subject: this.state.subjects.filter(item=> obj.subject.id===item.id)[0].title,
      formData: {
      title:obj.title,
      image:obj.image,
      subject:this.state.subjects.filter(item=> obj.subject.id===item.id )[0].id,
      description:obj.description,
      file:null
    }},()=>{
      this.setState({show:true})
    })
  }
  
  fetchSubjectsTests(testID){
    axios.get(`/api/tests/${testID}/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        this.setState({tests:data});
    });
  }

  handleViewButton(obj){
    this.props.history.push({pathname:'/tests/view',data:obj})
  }

  handleSectionButton(obj){
    this.props.history.push({pathname:`/tests/sections/${obj.id}`})
  }

  handleShowDeleteModal(obj){
    this.setState({ id: obj.id},()=>{
      this.setState({show2:true})
    })
  }

  handleAddButton(obj){
    this.props.history.push({pathname:'/tests/add'})
  }

  handleEditButton(obj){
    this.props.history.push({pathname:`/tests/edit/${obj.id}`})
  }

  handleFormDataChange(e) {
    console.log(this.state.formData.file,this.state)
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
    }else if(e.target.name === 'image'){
      if(e.target.files.length){
        let file = e.target.files[0]
        this.setState({ formData: {
          ...this.state.formData,
          file : file,
      }});
      }
    }
    else if(e.target.name==='clear'){
      this.setState({ 
        clear: e.target.checked
      });
    }else{
      this.setState({ formData: {
        ...this.state.formData,
        [e.target.name] : e.target.value
    }});
    }
  }

  renderCourses(cell, row, enumObject, rowIndex) {
      return (
        <Row md={12}>
          {
          row.course.map((item)=>{
            return(
              <Col md={6}><Badge>{item.title}</Badge></Col>
            )
        })}   
        </Row>
      )
    }
  
  renderSubjects(cell, row, enumObject, rowIndex) {
    return (
        <Row md={12}>
            <Col md={6}><div>{row.subject !== null ? row.subject.title : ''} { row.unit !== null ? ' ('+row.unit.title+')' : '...'}</div></Col>
        </Row>
    )
  }

  renderTypeOfTest(cell, row, enumObject, rowIndex) {
    return (
        <div>
          <Row md={12}>
            <Col md={12}><div>{row.typeOfTest.toUpperCase()}</div></Col>
          </Row>
          <Row md={12}>
            <Col md={12}><div>{row.typeOfTest === 'upcoming' ? row.startTime : null }</div></Col>
          </Row>
          <Row md={12}>
            <Col md={12}><div>{row.typeOfTest === 'upcoming' ? row.endtime : null }</div></Col>
          </Row>
        </div>
    )
  }

  renderColumn(cell, row, enumObject, rowIndex) {
    return (
      <div>
        <Grid> 
          <Row>
          <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" style={{width:'80px'}} bsStyle="primary" onClick={this.handleViewButton.bind(this,row)}>
                  <Glyphicon glyph="list-alt" /> VIEW
                </Button>
                <Button bsSize="small" style={{width:'80px'}} bsStyle="default" onClick={this.handleSectionButton.bind(this,row)}>
                  <Glyphicon glyph="bars" /> SECTIONS
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Row>
          <Row>
            <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" style={{width:'80px'}} bsStyle="info" onClick={this.handleEditButton.bind(this,row)}>
                  <Glyphicon glyph="edit" /> EDIT
                </Button>
                <Button bsSize="small" style={{width:'80px'}} bsStyle="danger" onClick={this.handleShowDeleteModal.bind(this,row)} >
                  <Glyphicon glyph="trash" /> DELETE
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Row>
        </Grid>
      </div>
    )
  }

  onPageChange(page, sizePerPage=10) {
    const currentIndex = (page - 1) * sizePerPage;
    this.fetchTests(`?page=${page}`,currentIndex)
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
                title="Tests"
                addButton={true}
                handleShowAddModal={this.handleAddButton.bind(this)}
                ctTableFullWidth
                ctTableResponsive
                content={
                  <div style={{margin:10}}>
                    <BootstrapTable
                      condensed pagination
                      data={this.state.data.results}
                      search remote
                      fetchInfo={ { dataTotalSize: this.state.data.count } }
                      options={ { sizePerPage: 10,
                                  onPageChange: this.onPageChange.bind(this),
                                  sizePerPageList: [ 10 ],
                                  page: this.state.page} }>
                        <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='title'>Test</TableHeaderColumn>
                        <TableHeaderColumn dataField='typeOfTest' dataFormat={this.renderTypeOfTest.bind(this)}>Type Of Test</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField='duration'>Duration</TableHeaderColumn>
                        <TableHeaderColumn dataField='test' dataFormat={this.renderSubjects.bind(this)}>Subjects</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderCourses.bind(this)}>Courses</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <DeleteTest
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      testDeleted={this.state.testDeleted}
                      deletingTest={this.state.deletingTest}
                      handleDelete={this.handleDelete.bind(this)}
                      id={this.state.id}
                    />
                    {/* <EditTest 
                      show={this.state.show} 
                      onHide={this.handleHideEditModal.bind(this)} 
                      testUpdated={this.state.testUpdated} 
                      formData={this.state.formData} 
                      handleFormDataChange={this.handleFormDataChange.bind(this)} 
                      subjects={this.state.subjects}
                      subject={this.state.subject}
                      handleSelect={this.handleSelectSubject.bind(this)}
                      updatingTest={this.state.updatingTest}
                      handleEdit={this.handleEdit.bind(this)}
                      fetchMore={this.fetchMore.bind(this)}
                      hasMore={this.state.next === null ? false :true}
                      dropdown={this.state.dropdown}
                      toggle={this.toggleDropdown.bind(this)}
                    />
                    <DeleteTest
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      testDeleted={this.state.testDeleted}
                      deletingTest={this.state.deletingTest}
                      handleDelete={this.handleDelete.bind(this)}
                      transferData={this.state.transferData}
                      toggle={this.toggleTransferData.bind(this)}
                      tests={this.state.tests}
                      id={this.state.id}
                      test={this.state.transferTo}
                      handleSelect={this.handleSelect.bind(this)}
                    />
                    <AddTests
                      show={this.state.show3}
                      onHide={this.handleHideAddModal.bind(this)}
                      testAdded={this.state.testAdded}
                      addingTest={this.state.addingTest}
                      handleAdd={this.handleAdd.bind(this)}
                      formData={this.state.formData}
                      subjects={this.state.subjects}
                      subject={this.state.subject}
                      handleSelect={this.handleSelectSubject.bind(this)}
                      handleFormDataChange={this.handleFormDataChange.bind(this)}
                      fetchMore={this.fetchMore.bind(this)}
                      hasMore={this.state.next === null ? false :true}
                      dropdown={this.state.dropdown}
                      toggle={this.toggleDropdown.bind(this)}/> */}
                  </div>
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Tests;
