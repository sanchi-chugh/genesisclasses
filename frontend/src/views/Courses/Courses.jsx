import React, { Component } from "react";
import { Grid, 
         Row, 
         Col, 
         ButtonToolbar, 
         ButtonGroup, 
         Button, 
         Glyphicon, 
} from "react-bootstrap";
import axios from 'axios';

import Card from "../../components/Card/Card.jsx";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import EditCourse from "../../components/Actions/Courses/EditCourse";
import DeleteCourse from "../../components/Actions/Courses/DeleteCourse";
import AddCourse from "../../components/Actions/Courses/AddCourse";

class Courses extends Component {

    constructor() {
        super();
        this.handleTextChange = this.handleTextChange.bind(this);
        this.state = {
          data: [],
          show: false,//edit modal
          show2:false,//delete modal
          show3:false,//add modal
          value: '',
          id:null,
          updatingCourse:false,
          courseUpdated:false,
          courseDeleted:false,
          deletingCourse:false,
          courseAdded:false,
          addingCourse:false,
          errors:{}
        };
      }
  
  componentDidMount() {
   this.fetchCourses();
  }

  fetchCourses(){
    axios.get("/api/courses/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
          const data = res.data.map(item => {
          item.sno = res.data.indexOf(item) + 1;
          return item;
        })
        this.setState({data:data});
    });
  }

  handleHideEditModal() {
    this.setState({ show: false, updatingCourse:false, courseUpdated:false, value:'', errors: {}});
  }

  handleHideAddModal() {
    this.setState({ show3: false, addingCourse:false, courseAdded:false,value:'', errors: {}});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingCourse:false, courseDeleted:false, transferData:false,transferTo:'Select Course', course:null, errors:{}});
  }

  handleAdd(e){
    e.preventDefault();
    this.setState({ addingCourse: true }, () => {
      const data = {title:this.state.value}
      axios.post('/api/courses/add/', data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ addingCourse: false, courseAdded:true }, () => {
        this.fetchCourses();
        this.props.handleClick('tr','Added Successfully');
        this.handleHideAddModal();
      }))
      .catch((err) => this.setState({ addingCourse: false, errors: err.response.data }, () => console.log(err)))
    });
  }

  handleDelete = () => {
    this.setState({ deletingCourse: true }, () => {
        axios.delete(`/api/courses/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingCourse: false,courseDeleted:true}, () => {
              this.fetchCourses();
              this.props.handleClick('tr','Deleted Successfully');
              this.handleHideDeleteModal();
            })
          })
          .catch((err) => this.setState({ deletingCourse: false, errors: err.response.data}, () => console.log(err)))
    });
  } 

  handleEdit(e) {
    e.preventDefault();
    this.setState({ updatingCourse: true }, () => {
      const data = {title:this.state.value}
      axios.put(`/api/courses/edit/${this.state.id}/`, data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingCourse: false, courseUpdated:true }, () => {
          this.fetchCourses();
          this.props.handleClick('tr','Updated Successfully');
          this.handleHideEditModal();
        })
      })
      .catch((err) => this.setState({ updatingCourse: false, errors: err.response.data }, () => console.log(err)))
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

  handleTextChange(e) {
    this.setState({ value: e.target.value.trimLeft() });
  }

  toggleTransferData(e){
    this.setState({transferData: !this.state.transferData})
  }

  handleSelect(item){
    this.setState({transferTo:item.title, course:item.id})
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
                title="Courses"
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
                        <TableHeaderColumn dataField='title'>Course</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <EditCourse 
                      show={this.state.show} 
                      onHide={this.handleHideEditModal.bind(this)} 
                      courseUpdated={this.state.courseUpdated} 
                      value={this.state.value} 
                      handleTextChange={this.handleTextChange.bind(this)} 
                      updatingCourse={this.state.updatingCourse}
                      handleEdit={this.handleEdit.bind(this)}
                      errors={this.state.errors}
                    />
                    <DeleteCourse
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      courseDeleted={this.state.courseDeleted}
                      deletingCourse={this.state.deletingCourse}
                      handleDelete={this.handleDelete.bind(this)}
                      errors={this.state.errors}
                    />
                    <AddCourse
                      show={this.state.show3}
                      onHide={this.handleHideAddModal.bind(this)}
                      courseAdded={this.state.courseAdded}
                      addingCourse={this.state.addingCourse}
                      handleAdd={this.handleAdd.bind(this)}
                      value={this.state.value}
                      handleTextChange={this.handleTextChange.bind(this)}
                      errors={this.state.errors}
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

export default Courses;
