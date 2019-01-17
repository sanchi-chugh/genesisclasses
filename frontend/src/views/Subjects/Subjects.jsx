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
import EditSubject from "../../components/Actions/Subjects/EditSubject";
import DeleteSubject from "../../components/Actions/Subjects/DeleteSubject";
import AddSubject from "../../components/Actions/Subjects/AddSubject";

class Subjects extends Component {

    constructor() {
        super();
        this.handleFormDataChange = this.handleFormDataChange.bind(this);
        this.state = {
          data: [],
          show: false,//edit modal
          show2:false,//delete modal
          show3:false,//add modal
          formData:{
            title:'',
            description:'',
            image:'',
            course:[]
          },
          courses:[],
          value: '',
          id:null,
          updatingSubject:false,
          subjectUpdated:false,
          subjectDeleted:false,
          deletingSubject:false,
          transferData:false,
          transferTo:'Select Subject',
          subject:null,
          subjectAdded:false,
          addingSubject:false,

        };
      }
  
  componentDidMount() {
   this.fetchSubjects();
   this.fetchCourses();
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

  fetchSubjects(){
    axios.get("/api/subjects/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
          const data = res.data.map(item => {
          item.sno = res.data.indexOf(item) + 1;
          return item;
        })
        console.log(data)
        this.setState({data:data});
    });
  }

  handleHideEditModal() {
    this.setState({ show: false, updatingSubject:false, subjectUpdated:false, value:''});
  }

  handleHideAddModal() {
    this.setState({ 
      show3: false, 
      addingSubject:false, 
      subjectAdded:false,
      formData:{
        title:'',
        description:'',
        image:'',
        course:[]
    }});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingSubject:false, subjectDeleted:false, transferData:false,transferTo:'Select Subject', subject:null});
  }

  handleAdd(){
    this.setState({ addingSubject: true }, () => {
      const data = {
        title:this.state.formData.title,
        description:this.state.formData.description,
        image:this.state.formData.image,
        course:this.state.formData.course.join(',')
      }
      axios.post('/api/subjects/add/', data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ addingSubject: false, subjectAdded:true }, this.fetchSubjects()))
      .catch((err) => this.setState({ addingSubject: false }, () => console.log(err)))
    });
  }

  handleDelete = () => {
    this.setState({ deletingSubject: true }, () => {
      if(this.state.transferData){
        const data = {data:{ "subject" : this.state.subject }};
        axios.delete(`/api/subjects/delete/${this.state.id}/`, data , {
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingSubject: false, subjectDeleted:true, transferData:false},this.fetchSubjects())
          })
          .catch((err) => this.setState({ deletingSubject: false }, () => console.log(err)))
      }else{
        axios.delete(`/api/subjects/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingSubject: false,subjectDeleted:true, transferData:false},this.fetchSubjects())
          })
          .catch((err) => this.setState({ deletingSubject: false }, () => console.log(err)))
      }
    });
  } 

  handleEdit() {
    this.setState({ updatingSubject: true }, () => {
      const data = {title:this.state.value}
      axios.put(`/api/subjects/edit/${this.state.id}/`, data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingSubject: false, subjectUpdated:true }); this.fetchSubjects()})
      .catch((err) => this.setState({ updatingSubject: false }, () => console.log(err)))
    });
  }

  handleShowEditModal(obj){
    this.setState({ id: obj.id , value: obj.title},()=>{
      this.setState({show:true})
    })
  }
  
  handleShowDeleteModal(obj){
    this.setState({ id: obj.id},()=>{
      this.setState({show2:true})
    })
  }

  handleShowAddModal(){
    this.setState({show3:true})
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
    }
    else{
      this.setState({ formData: {
        ...this.state.formData,
        [e.target.name] : e.target.value
    }});
    }
  }

  toggleTransferData(e){
    this.setState({transferData: !this.state.transferData})
  }

  handleSelect(item){
    this.setState({transferTo:item.title, subject:item.id})
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

  renderColumn(cell, row, enumObject, rowIndex) {
    return (
      <div>
        <Grid> 
          <Col>
            <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" bsStyle="primary" onClick={this.handleShowEditModal.bind(this,row)}>
                  <Glyphicon glyph="edit" /> EDIT
                </Button>
                <Button bsSize="small" bsStyle="danger" onClick={this.handleShowDeleteModal.bind(this,row)}>
                  <Glyphicon glyph="trash" /> DELETE
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
      <div className="content modal-container">
        <Grid fluid>
          <Row>
            <Col>
              <Card
                title="Subjects"
                addButton={true}
                handleShowAddModal={this.handleShowAddModal.bind(this)}
                ctTableFullWidth
                ctTableResponsive
                content={
                  <div style={{margin:10}}>
                    <BootstrapTable
                      condensed pagination
                      data={this.state.data}
                      search>
                        <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='title'>Subject</TableHeaderColumn>
                        <TableHeaderColumn dataField='courses' dataFormat={this.renderCourses.bind(this)}>Courses</TableHeaderColumn>
                        <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <EditSubject 
                      show={this.state.show} 
                      onHide={this.handleHideEditModal.bind(this)} 
                      subjectUpdated={this.state.subjectUpdated} 
                      value={this.state.value} 
                      handleFormDataChange={this.handleFormDataChange.bind(this)} 
                      updatingSubject={this.state.updatingSubject}
                      handleEdit={this.handleEdit.bind(this)}
                    />
                    <DeleteSubject
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      subjectDeleted={this.state.subjectDeleted}
                      deletingSubject={this.state.deletingSubject}
                      handleDelete={this.handleDelete.bind(this)}
                      transferData={this.state.transferData}
                      toggle={this.toggleTransferData.bind(this)}
                      subjects={this.state.data}
                      id={this.state.id}
                      subject={this.state.transferTo}
                      handleSelect={this.handleSelect.bind(this)}
                    />
                    <AddSubject
                      show={this.state.show3}
                      onHide={this.handleHideAddModal.bind(this)}
                      subjectAdded={this.state.subjectAdded}
                      addingSubject={this.state.addingSubject}
                      handleAdd={this.handleAdd.bind(this)}
                      formData={this.state.formData}
                      courses={this.state.courses}
                      handleFormDataChange={this.handleFormDataChange.bind(this)}
                    />
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

export default Subjects;
