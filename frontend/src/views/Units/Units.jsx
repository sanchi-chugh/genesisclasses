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
import AddUnits from "../../components/Actions/Units/AddUnits";
import EditUnit from "../../components/Actions/Units/EditUnits";

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
            subject: ''
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
          subjects:[],
          search:false,
          searchString:'',
          subject: 'Select Subject',
          next:'',
          dropdown:false,
          errors: {}
        };
      }
  
  componentWillMount() {
   this.fetchUnits(`?page=1`);
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
        const data = res.data;
        this.setState({subjects:data,
                       next:res.data.next});
    });
  }
  
  fetchUnits(page,index=0){
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
    axios.get( `/api/units/${page}${searchString}`, {
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
    this.setState({ 
      show: false, 
      updatingUnit:false,
      unitUpdated:false, 
      value:'',
      clear:false, 
      formData:{
        title:'',
        description:'',
        file:null,
        image:'',
        subject:''
      },
      errors: {}});
  }

  handleHideAddModal() {
    this.setState({ 
      show3: false, 
      addingUnit:false, 
      unitAdded:false,
      subject:'Select Subject',
      formData:{
        title:'',
        description:'',
        file:null,
        image:'',
        subject:''
      },
      errors: {}
    });
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingUnit:false, unitDeleted:false, transferData:false,transferTo:'Select Unit', unit:null});
  }

  handleAdd(e){
    e.preventDefault();
    this.setState({ addingUnit: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('subject',this.state.formData.subject)
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
      .then((res) => this.setState({ addingUnit: false, unitAdded:true }, ()=>{
        this.fetchSubjectsChoice();
        this.fetchUnits(`?page=1`);
        this.props.handleClick('tr','Added Successfully');
        this.handleHideAddModal();
      }))
      .catch((err) => this.setState({ addingUnit: false, errors: err.response.data }, () => console.log(err)))
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
            this.setState({ deletingUnits: false, unitDeleted:true, transferData:false},()=>{
              this.fetchUnits(`?page=${this.state.page}`,(this.state.page-1)*10)
              this.props.handleClick('tr','Deleted Successfully');
              this.handleHideDeleteModal();
            })
          })
          .catch((err) => this.setState({ deletingUnits: false }, () => console.log(err)))
      }else{
        axios.delete(`/api/units/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingUnit: false,unitDeleted:true, transferData:false},()=>{
              this.fetchUnits(`?page=${this.state.page}`,(this.state.page-1)*10)
              this.props.handleClick('tr','Deleted Successfully');
              this.handleHideDeleteModal();
            })
          })
          .catch((err) => this.setState({ deletingUnit: false }, () => console.log(err)))
       }
    });
  } 

  handleEdit(e) {
    e.preventDefault();
    this.setState({ updatingUnit: true }, () => {
      console.log(this.state.formData)
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('subject',this.state.formData.subject)
      formData.append('description',this.state.formData.description)
      this.state.clear ? formData.append('image','') : (this.state.formData.file !== null ? formData.append('image',this.state.formData.file,this.state.formData.file.name) : console.log("debug") )
      axios.put(`/api/units/edit/${this.state.id}/`, formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingUnit: false, unitUpdated:true },()=>{
              this.fetchUnits(`?page=1`);
              this.fetchSubjectsChoice();
              this.props.handleClick('tr','Updated Successfully');
              this.handleHideEditModal();
            })
          })
      .catch((err) => this.setState({ updatingUnit: false, errors: err.response.data }, () => console.log(err)))
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
      description:obj.description === null ? '' : obj.description,
      file:null
    }},()=>{
      this.setState({show:true})
    })
  }
  
  fetchSubjectsUnits(unitID){
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
    this.fetchSubjectsUnits(obj.subject.id);
    this.setState({ id: obj.id},()=>{
      this.setState({show2:true})
    })
  }

  handleShowAddModal(){
    console.log(this.props)
    this.setState({show3:true})
  }

  handleFormDataChange(e) {
    console.log(this.state.formData,this.state)
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
        document.getElementById('text').innerHTML = `<a href="${URL.createObjectURL(e.target.files[0])}" target="_blank">${e.target.files[0].name}</a>`
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
        [e.target.name] : e.target.value.trimLeft()
    }});
    }
  }

  toggleTransferData(e){
    this.setState({transferData: !this.state.transferData})
  }

  handleSelect(item){
    this.setState({transferTo:item.title, unit:item.id})
  }

  handleSelectSubject(item){
    this.setState({
      subject:item.title,
      formData:{
        ...this.state.formData,
        subject:item.id
      }
    })
    this.toggleDropdown()
  }

  toggleDropdown(){
    this.setState({
      dropdown:!this.state.dropdown
    })
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
  
  renderSubjects(cell, row, enumObject, rowIndex) {
    return (
        <Row md={12}>
            <Col md={6}><div>{row.subject.title}</div></Col>
        </Row>
    )
  }

  renderDescription(cell, row, enumObject, rowIndex){
    return (
      <div style={{overflow: 'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>
        {row.description !== null && row.description !== '' ? row.description : '...'}
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

  onPageChange(page, sizePerPage=10) {
    const currentIndex = (page - 1) * sizePerPage;
    this.fetchUnits(`?page=${page}`,currentIndex)
    console.log(currentIndex,page,sizePerPage,this.state.data)
    this.setState({
      page: page,
    });
  }

  handleSearchChange(string){
    console.log(string)
    if(string.trim() !== ''){
      this.setState({
        search:true,
        searchString:string.trim(),
        page:1
      },()=>{
        this.fetchUnits(`?page=1`);
      })
    }else{
      this.setState({
        search:false,
        searchString:'',
        page:1
      },()=>{
        this.fetchUnits(`?page=1`);
      })
    }
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
                                  onSearchChange: this.handleSearchChange.bind(this),
                                  sizePerPageList: [ 10 ],
                                  page: this.state.page} }>
                        <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='title'>Unit</TableHeaderColumn>
                        <TableHeaderColumn dataField='description' dataFormat={this.renderDescription.bind(this)}>Description</TableHeaderColumn>
                        <TableHeaderColumn dataField='unit' dataFormat={this.renderSubjects.bind(this)}>Subjects</TableHeaderColumn>
                        <TableHeaderColumn dataField='courses' dataFormat={this.renderCourses.bind(this)}>Courses</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <EditUnit 
                      show={this.state.show} 
                      onHide={this.handleHideEditModal.bind(this)} 
                      unitUpdated={this.state.unitUpdated} 
                      formData={this.state.formData} 
                      handleFormDataChange={this.handleFormDataChange.bind(this)} 
                      subjects={this.state.subjects}
                      subject={this.state.subject}
                      handleSelect={this.handleSelectSubject.bind(this)}
                      updatingUnit={this.state.updatingUnit}
                      handleEdit={this.handleEdit.bind(this)}
                      fetchMore={this.fetchMore.bind(this)}
                      hasMore={this.state.next === null ? false :true}
                      dropdown={this.state.dropdown}
                      toggle={this.toggleDropdown.bind(this)}
                      errors={this.state.errors}
                    />
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
                      errors={this.state.errors}
                    />
                    <AddUnits
                      show={this.state.show3}
                      onHide={this.handleHideAddModal.bind(this)}
                      unitAdded={this.state.unitAdded}
                      addingUnit={this.state.addingUnit}
                      handleAdd={this.handleAdd.bind(this)}
                      formData={this.state.formData}
                      subjects={this.state.subjects}
                      subject={this.state.subject}
                      handleSelect={this.handleSelectSubject.bind(this)}
                      handleFormDataChange={this.handleFormDataChange.bind(this)}
                      fetchMore={this.fetchMore.bind(this)}
                      hasMore={this.state.next === null ? false :true}
                      dropdown={this.state.dropdown}
                      toggle={this.toggleDropdown.bind(this)}
                      errors={this.state.errors}/>
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
