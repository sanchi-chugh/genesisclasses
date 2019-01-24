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
import DeleteUnit from "../../components/Actions/Units/DeleteUnits";

class Units extends Component {

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
            course:[]
          },
          unitChoice:[],
          value: '',
          id:null,
          updatingUnit:false,
          unitUpdated:false,
          unitDeleted:false,
          deletingUnit:false,
          transferData:false,
          transferTo:'Select Unit',
          unit:null,
          units:[],
          unitAdded:false,
          addingUnit:false,
          clear:false,
          page:1,
        };
      }
  
  componentWillMount() {
   this.fetchUnits(`?page=1`);
  }
  
  fetchUnitChoice(){
    axios.get("/api/unitChoice/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        this.setState({unitChoice:data});
    });
  }
  
  fetchUnits(page,index=0){
    if(page===`?page=1`){
        page=""
    }
    axios.get( `/api/units/${page}`, {
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
    this.setState({ show: false, updatingUnit:false, unitUpdated:false, value:''});
  }

  handleHideAddModal() {
    this.setState({ 
      show3: false, 
      addingUnit:false, 
      unitAdded:false,
      formData:{
        title:'',
        description:'',
        file:null,
        image:'',
        course:[]
    }});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingUnit:false, unitDeleted:false, transferData:false,transferTo:'Select Unit', unit:null});
  }

  handleAdd(){
    this.setState({ addingUnit: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('course',this.state.formData.course.join(','))
      formData.append('description',this.state.formData.description)
      if(this.state.formData.file !== null){
        formData.append('image',this.state.formData.file,this.state.formData.file.name)
      }else{
        formData.append('image','')
      }
      axios.post('/api/units/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState({ addingUnit: false, unitAdded:true }, this.fetchUnits()))
      .catch((err) => this.setState({ addingUnit: false }, () => console.log(err)))
    });
  }

  handleDelete = () => {
    this.setState({ deletingUnit: true }, () => {
      if(this.state.transferData){
        const data = { "unit" : this.state.unit };
        axios.delete(`/api/units/delete/${this.state.id}/`, data , {
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingUnits: false, unitDeleted:true, transferData:false},this.this.fetchUnits(`?page=${this.state.page}`,(this.state.page-1)*10))
          })
          .catch((err) => this.setState({ deletingUnits: false }, () => console.log(err)))
      }else{
        axios.delete(`/api/units/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingUnit: false,unitDeleted:true, transferData:false},this.fetchUnits(`?page=${this.state.page}`,(this.state.page-1)*10))
          })
          .catch((err) => this.setState({ deletingUnit: false }, () => console.log(err)))
       }
    });
  } 

  handleEdit() {
    this.setState({ updatingUnit: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('course',this.state.formData.course.join(','))
      formData.append('description',this.state.formData.description)
      this.state.clear ? formData.append('image','') : this.state.formData.file !== null ? formData.append('image',this.state.formData.file,this.state.formData.file.name) : formData.append('image','')
      axios.put(`/api/units/edit/${this.state.id}/`, formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingUnit: false, unitUpdated:true }); this.fetchUnits()})
      .catch((err) => this.setState({ updatingUnit: false }, () => console.log(err)))
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
  
  fetchUnitsUnits(unitID){
    axios.get(`/api/units/${unitID}/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        this.setState({units:data});
    });
  }

  handleShowDeleteModal(obj){
    this.fetchUnitsUnits(obj.subject.id);
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
    this.setState({transferTo:item.title, unit:item.id})
  }

  renderCourses(cell, row, enumObject, rowIndex) {
      return (
        <Row md={12}>
          {
          row.course.map((item)=>{
            return(
              <Col md={6}><Badge>{item}</Badge></Col>
            )
        })}   
        </Row>
      )
    }
  
  renderSubjects(cell, row, enumObject, rowIndex) {
    return (
        <Row md={12}>
            <Col md={6}><div>{row.subject.title}</div></Col>
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

  onPageChange(page, sizePerPage=10) {
    const currentIndex = (page - 1) * sizePerPage;
    this.fetchUnits(`?page=${page}`,currentIndex)
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
                title="Units"
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
                                  sizePerPageList: [ 10 ],
                                  page: this.state.page} }>
                        <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='title'>Unit</TableHeaderColumn>
                        <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
                        <TableHeaderColumn dataField='unit' dataFormat={this.renderSubjects.bind(this)}>Subjects</TableHeaderColumn>
                        <TableHeaderColumn dataField='courses' dataFormat={this.renderCourses.bind(this)}>Courses</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <DeleteUnit
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      unitDeleted={this.state.unitDeleted}
                      deletingUnit={this.state.deletingUnit}
                      handleDelete={this.handleDelete.bind(this)}
                      transferData={this.state.transferData}
                      toggle={this.toggleTransferData.bind(this)}
                      units={this.state.units}
                      id={this.state.id}
                      unit={this.state.transferTo}
                      handleSelect={this.handleSelect.bind(this)}
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

export default Units;
