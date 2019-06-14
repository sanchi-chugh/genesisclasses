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
import EditSection from "../../components/Actions/Sections/EditSection";
import DeleteSection from "../../components/Actions/Sections/DeleteSection";
import AddSection from "../../components/Actions/Sections/AddSection";

class Sections extends Component {

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
          updatingSection:false,
          sectionUpdated:false,
          sectionDeleted:false,
          deletingSection:false,
          sectionAdded:false,
          addingSection:false,
          errors: {}
        };
      }
  
  componentDidMount() {
   this.fetchSections();
  }

  fetchSections(){
    axios.get(`/api/tests/sections/${this.props.match.params.id}/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
          console.log(res)
          const data = res.data.map(item => {
          item.sno = res.data.indexOf(item) + 1;
          return item;
        })
        this.setState({data:data});
    });
  }

  handleHideEditModal() {
    this.setState({ show: false, updatingSection:false, sectionUpdated:false, value:'', errors:{}});
  }

  handleHideAddModal() {
    this.setState({ show3: false, addingSection:false, sectionAdded:false,value:'', errors:{}});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingSection:false, sectionDeleted:false});
  }

  handleAdd(e){
    e.preventDefault();
    this.setState({ addingSection: true }, () => {
      const data = {title:this.state.value,test:this.props.match.params.id}
      axios.post('/api/tests/sections/add/', data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ addingSection: false, sectionAdded:true },()=>{
        this.fetchSections();
        this.props.handleClick('tr','Added Successfully');
        this.handleHideAddModal();
      }))
      .catch((err) => this.setState({ addingSection: false, errors: err.response.data }, () => console.log(err)))
    });
  }

  handleDelete = () => {
    this.setState({ deletingSection: true }, () => {
      axios.delete(`/api/tests/sections/delete/${this.state.id}/`,{
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {
        this.setState({ deletingSection: false,sectionDeleted:true},()=>{
          this.fetchSections();
          this.props.handleClick('tr','Deleted Successfully');
          this.handleHideDeleteModal();
        })
      })
      .catch((err) => this.setState({ deletingSection: false }, () => console.log(err)))
    });
  } 

  handleEdit(e) {
    e.preventDefault();
    this.setState({ updatingSection: true }, () => {
      const data = {title:this.state.value}
      axios.put(`/api/tests/sections/edit/${this.state.id}/`, data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {
        this.setState({ updatingSection: false, sectionUpdated:true }, ()=>{
          this.fetchSections();
          this.props.handleClick('tr','Updated Successfully');
          this.handleHideEditModal();
        })
      })
      .catch((err) => this.setState({ updatingSection: false, errors: err.response.data}, () => console.log(err)))
    });
  }

  handleViewButton(obj){
    this.props.history.push({pathname:`/tests/sections/questions/${obj.id}`})
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
  
  renderColumn(cell, row, enumObject, rowIndex) {
    return (
      <div>
        <Grid fluid> 
          <Row>
           <Button bsSize="small" style={{width:'160px'}} bsStyle="primary" onClick={this.handleViewButton.bind(this,row)}>
            <Glyphicon glyph="list-alt" /> VIEW QUESTIONS
           </Button>
          </Row>
          <Row>
            <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" style={{width:'80px'}} bsStyle="primary" onClick={this.handleShowEditModal.bind(this,row)}>
                  <Glyphicon glyph="edit" /> EDIT
                </Button>
                <Button bsSize="small" style={{width:'80px'}} bsStyle="danger" onClick={this.handleShowDeleteModal.bind(this,row)}>
                  <Glyphicon glyph="trash" /> DELETE
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Row>
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
                title="Sections"
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
                        <TableHeaderColumn dataField='title'>Section</TableHeaderColumn>
                        <TableHeaderColumn dataField='totalMarks'>Marks</TableHeaderColumn>
                        <TableHeaderColumn dataField='totalQuestions'>Number Of Questions</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <EditSection 
                      show={this.state.show} 
                      onHide={this.handleHideEditModal.bind(this)} 
                      sectionUpdated={this.state.sectionUpdated} 
                      value={this.state.value} 
                      handleTextChange={this.handleTextChange.bind(this)} 
                      updatingSection={this.state.updatingSection}
                      errors={this.state.errors}
                      handleEdit={this.handleEdit.bind(this)}
                    />
                    <DeleteSection
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      sectionDeleted={this.state.sectionDeleted}
                      deletingSection={this.state.deletingSection}
                      handleDelete={this.handleDelete.bind(this)}
                      id={this.state.id}
                    />
                    <AddSection
                      show={this.state.show3}
                      onHide={this.handleHideAddModal.bind(this)}
                      sectionAdded={this.state.sectionAdded}
                      addingSection={this.state.addingSection}
                      handleAdd={this.handleAdd.bind(this)}
                      value={this.state.value}
                      errors={this.state.errors}
                      handleTextChange={this.handleTextChange.bind(this)}
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

export default Sections;
