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
            file:null,
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
          clear:false,
          errors:{}
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
        this.setState({data:data});
    });
  }

  handleHideEditModal() {
    this.setState({ 
      show: false, 
      updatingSubject:false, 
      subjectUpdated:false, 
      value:'',
      formData:{
        title:'',
        description:'',
        file:null,
        image:'',
        course:[]
      },
      errors:{}
    });
  }

  handleHideAddModal() {
    this.setState({ 
      show3: false, 
      addingSubject:false, 
      subjectAdded:false,
      formData:{
        title:'',
        description:'',
        file:null,
        image:'',
        course:[]
      },
      errors:{}
    });
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingSubject:false, subjectDeleted:false, transferData:false,transferTo:'Select Subject', subject:null});
  }

  handleAdd(){
    this.setState({ addingSubject: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('course',this.state.formData.course.join(','))
      formData.append('description',this.state.formData.description)
      if(this.state.formData.file !== null){
        formData.append('image',this.state.formData.file,this.state.formData.file.name)
      }else{
        formData.append('image','')
      }
      axios.post('/api/subjects/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState({ addingSubject: false, subjectAdded:true }, () => {
          this.fetchSubjects();
          this.props.handleClick('tr','Added Successfully');
          this.handleHideAddModal();
        }))
      .catch((err) => this.setState({ addingSubject: false, errors: err.response.data }, () => console.log(err)))
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
            this.setState({ deletingSubject: false, subjectDeleted:true, transferData:false}, () => {
              this.fetchSubjects();
              this.props.handleClick('tr','Deleted Successfully');
              this.handleHideDeleteModal();
            })
          })
          .catch((err) => this.setState({ deletingSubject: false }, () => console.log(err)))
      }else{
        axios.delete(`/api/subjects/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingSubject: false,subjectDeleted:true, transferData:false}, () => {
              this.fetchSubjects();
              this.props.handleClick('tr','Deleted Successfully');
              this.handleHideDeleteModal();
            })
          })
          .catch((err) => this.setState({ deletingSubject: false }, () => console.log(err)))
       }
    });
  } 

  handleEdit() {
    this.setState({ updatingSubject: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('course',this.state.formData.course.join(','))
      formData.append('description',this.state.formData.description)
      this.state.clear ? formData.append('image','') : this.state.formData.file !== null ? formData.append('image',this.state.formData.file,this.state.formData.file.name) : ''
      axios.put(`/api/subjects/edit/${this.state.id}/`, formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingSubject: false, subjectUpdated:true }, () => {
          this.fetchSubjects();
          this.props.handleClick('tr','Updated Successfully');
          this.handleHideEditModal();
        })
      })
      .catch((err) => this.setState({ updatingSubject: false, errors: err.response.data }, () => console.log(err)))
    });
  }

  handleShowEditModal(obj){
    this.setState({ id: obj.id , formData: {
      title:obj.title,
      image:obj.image,
      course:obj.course.map(item=>{
        return item.id
      }),
      description:obj.description,
      file:null
    }},()=>{
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
    console.log(this.state.formData.file,this.state)
    if(e.target.name === 'course' ){
        if(e.target.checked){
          this.setState({
            formData:{
              ...this.state.formData,
              course:[...this.state.formData.course, e.target.value]
            }
          })
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
        document.getElementById('text').innerHTML = `<a href="${URL.createObjectURL(e.target.files[0])}" target="_blank">${e.target.files[0].name}</a>`
        let file = e.target.files[0]
        this.setState({ formData: {
          ...this.state.formData,
          file : file
      }});
      }
    }
    else if(e.target.name==='clear'){
      this.setState({ 
        clear: !e.target.checked
      });
    }else{
      this.setState({ formData: {
        ...this.state.formData,
        [e.target.name] : e.target.value.trimLeft()
    }});
    }
  }

  toggleTransferData(e){
    this.setState({transferData: !this.state.transferData})
  }

  handleSelect(item){
    this.setState({transferTo:item.title, subject:item.id})
  }

  renderDescription(cell, row, enumObject, rowIndex){
    return (
      <div style={{overflow: 'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>
        {row.description !== null && row.description !== '' ? row.description : '...'}
      </div>
    )
  }

  renderCourses(cell, row, enumObject, rowIndex) {
      return (
        <div className="courseCell">
          {
          row.course.map((item)=>{
            return(
              <div className="courseBadge"><Badge>{item.title}</Badge></div>
            )
        })}   
        </div>
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
                        <TableHeaderColumn dataField='description' dataFormat={this.renderDescription.bind(this)}>Description</TableHeaderColumn>
                        <TableHeaderColumn dataField='courses' dataFormat={this.renderCourses.bind(this)}>Courses</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <EditSubject 
                      show={this.state.show} 
                      errors={this.state.errors}
                      onHide={this.handleHideEditModal.bind(this)} 
                      subjectUpdated={this.state.subjectUpdated} 
                      formData={this.state.formData} 
                      courses={this.state.courses}
                      handleFormDataChange={this.handleFormDataChange.bind(this)} 
                      updatingSubject={this.state.updatingSubject}
                      handleEdit={this.handleEdit.bind(this)}
                    />
                    <DeleteSubject
                      show={this.state.show2}
                      errors={this.state.errors}
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
                      errors={this.state.errors}
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
