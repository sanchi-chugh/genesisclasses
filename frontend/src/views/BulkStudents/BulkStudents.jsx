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

class BulkStudents extends Component {

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
          page:1
        };
      }
  
  componentDidMount() {
   this.fetchBulkStudents(`?page=1`);
  }

  fetchBulkStudents(page,index=0){
    if(page===`?page=1`){
        page=""
    }
    axios.get( `/api/users/student/bulk/${page}`, {
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
        file:null,
        image:'',
        course:[]
    }});
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
      .then((res) => this.setState({ addingSubject: false, subjectAdded:true }, this.fetchBulkStudents()))
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
            this.setState({ deletingSubject: false, subjectDeleted:true, transferData:false},this.fetchBulkStudents())
          })
          .catch((err) => this.setState({ deletingSubject: false }, () => console.log(err)))
      }else{
        axios.delete(`/api/subjects/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingSubject: false,subjectDeleted:true, transferData:false},this.fetchBulkStudents())
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
      this.state.clear ? formData.append('image','') : this.state.formData.file !== null ? formData.append('image',this.state.formData.file,this.state.formData.file.name) : formData.append('image','')
      axios.put(`/api/subjects/edit/${this.state.id}/`, formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingSubject: false, subjectUpdated:true }); this.fetchBulkStudents()})
      .catch((err) => this.setState({ updatingSubject: false }, () => console.log(err)))
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

    renderSubjects(cell, row, enumObject, rowIndex) {
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
                      search remote
                      fetchInfo={ { dataTotalSize: this.state.data.count } }
                      options={ { sizePerPage: 10,
                                  onPageChange: this.onPageChange.bind(this),
                                  sizePerPageList: [ 5, 10 ],
                                  page: this.state.page} }>
                        <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='title'>Subject</TableHeaderColumn>
                        <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
                        <TableHeaderColumn dataField='subjects'>Description</TableHeaderColumn>
                    </BootstrapTable>
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

export default BulkStudents;
