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
import EditCategories from "../../components/Actions/Categories/EditCategories";
import DeleteCategories from "../../components/Actions/Categories/DeleteCategories";
import AddCategories from "../../components/Actions/Categories/AddCategories";

class Categories extends Component {

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
          },
          courses:[],
          value: '',
          id:null,
          updatingCategories:false,
          categoryUpdated:false,
          categoryDeleted:false,
          deletingCategories:false,
          categoryAdded:false,
          addingCategories:false,
          clear:false,
          errors:{}
        };
      }
  
  componentDidMount() {
   this.fetchCategories();
  }

  fetchCategories(){
    axios.get("/api/testCategories/", {
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
      updatingCategories:false, 
      errors:{},
      categoryUpdated:false, 
      formData:{
        title:'',
        description:'',
        file:null,
        image:'',
      }
    });
  }

  handleHideAddModal() {
    this.setState({ 
      show3: false, 
      addingCategories:false, 
      errors:{},
      categoryAdded:false,
      formData:{
        title:'',
        description:'',
        file:null,
        image:'',
    }});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingCategories:false, categoryDeleted:false});
  }

  handleAdd(e){
    e.preventDefault();
    this.setState({ addingCategories: true, err:null }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title !== null ? this.state.formData.title : '')
      formData.append('description',this.state.formData.description !== null ? this.state.formData.description :'' )
      if(this.state.formData.file !== null){
        formData.append('image',this.state.formData.file,this.state.formData.file.name)
      }else{
        formData.append('image','')
      }
      axios.post('/api/testCategories/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => {
        this.setState({ addingCategories: false, categoryAdded:true }, this.fetchCategories());
        this.props.handleClick('tr','Added Successfully');
        this.handleHideAddModal();
      })
      .catch((err) => this.setState({ addingCategories: false, errors: err.response.data }, () => {
        console.log(err)
      }))
    });
  }

  handleDelete = (e) => {
    e.preventDefault();
    this.setState({ deletingCategories: true, err:null }, () => {
        axios.delete(`/api/testCategories/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingCategories: false,categoryDeleted:true,},this.fetchCategories());
            this.props.handleClick('tr','Deleted Successfully');
            this.handleHideDeleteModal();
          })
          .catch((err) => this.setState({ deletingCategories: false, errors: err.response.data }, () => {
            console.log(err); 
          }))
      });
  } 

  handleEdit(e) {
    e.preventDefault();
    this.setState({ updatingCategories: true, err:null }, () => {
      console.log(this.state)
      var formData = new FormData();
      formData.append('title',this.state.formData.title !== null ? this.state.formData.title : '')
      formData.append('description',this.state.formData.description !== null ? this.state.formData.description :'' )
      this.state.clear ? formData.append('image','') : this.state.formData.file !== null ? formData.append('image',this.state.formData.file,this.state.formData.file.name) : null
      axios.put(`/api/testCategories/edit/${this.state.id}/`, formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {
        this.setState({ updatingCategories: false, categoryUpdated:true }); this.fetchCategories();
        this.props.handleClick('tr','Updated Successfully');
        this.handleHideEditModal();
      })
      .catch((err) => this.setState({ updatingCategories: false, errors: err.response.data }, () => {
        console.log(err); 
      }))
    });
  }

  handleShowEditModal(obj){
    // let file = null;
    // if(obj.image !== null && obj.image !== ''){
    //    file =  fetch(obj.image).then(res => {
    //      return new File([res], obj.image.split['/'][5])
    //    });
    //    console.log(file)
    // }
    // console.log(file);
    this.setState({ id: obj.id , formData: {
      title:obj.title,
      image:obj.image,
      description:obj.description,
      file: null
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
    if(e.target.name === 'image'){
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
        clear: e.target.checked
      });
    }else{
      this.setState({ formData: {
        ...this.state.formData,
        [e.target.name] : e.target.value.trimLeft()
    }});
    }
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

  render() {
    return (
      <div className="content modal-container">
        <Grid fluid>
          <Row>
            <Col>
              <Card
                title="Categories"
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
                        <TableHeaderColumn dataField='title'>Categories</TableHeaderColumn>
                        <TableHeaderColumn dataField='description' dataFormat={this.renderDescription.bind(this)}>Description</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <EditCategories 
                      show={this.state.show} 
                      onHide={this.handleHideEditModal.bind(this)} 
                      errors={this.state.errors}
                      categoryUpdated={this.state.categoryUpdated} 
                      formData={this.state.formData} 
                      courses={this.state.courses}
                      handleFormDataChange={this.handleFormDataChange.bind(this)} 
                      updatingCategories={this.state.updatingCategories}
                      handleEdit={this.handleEdit.bind(this)}
                    />
                    <DeleteCategories
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      categoryDeleted={this.state.categoryDeleted}
                      deletingCategories={this.state.deletingCategories}
                      handleDelete={this.handleDelete.bind(this)}
                      id={this.state.id}
                    />
                    <AddCategories
                      show={this.state.show3}
                      onHide={this.handleHideAddModal.bind(this)}
                      errors={this.state.errors}
                      categoryAdded={this.state.categoryAdded}
                      addingCategories={this.state.addingCategories}
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

export default Categories;
