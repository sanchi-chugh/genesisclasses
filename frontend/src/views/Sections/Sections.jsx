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
          transferData:false,
          transferTo:'Select Section',
          section:null,
          sectionAdded:false,
          addingSection:false,

        };
      }
  
  componentDidMount() {
   this.fetchSections();
  }

  fetchSections(){
    axios.get(`/api/sections/${this.props.match.params.id}`, {
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
    this.setState({ show: false, updatingSection:false, sectionUpdated:false, value:''});
  }

  handleHideAddModal() {
    this.setState({ show3: false, addingSection:false, sectionAdded:false,value:''});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingSection:false, sectionDeleted:false, transferData:false,transferTo:'Select Section', section:null});
  }

  handleAdd(){
    this.setState({ addingSection: true }, () => {
      const data = {location:this.state.value}
      axios.post('/api/sections/add/', data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ addingSection: false, sectionAdded:true }, this.fetchSections()))
      .catch((err) => this.setState({ addingSection: false }, () => console.log(err)))
    });
  }

  handleDelete = () => {
    this.setState({ deletingSection: true }, () => {
      if(this.state.transferData){
        const data = {data:{ "section" : this.state.section }};
        axios.delete(`/api/sections/delete/${this.state.id}/`, data , {
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingSection: false, sectionDeleted:true, transferData:false},this.fetchSections())
          })
          .catch((err) => this.setState({ deletingSection: false }, () => console.log(err)))
      }else{
        axios.delete(`/api/sections/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingSection: false,sectionDeleted:true, transferData:false},this.fetchSections())
          })
          .catch((err) => this.setState({ deletingSection: false }, () => console.log(err)))
      }
    });
  } 

  handleEdit() {
    this.setState({ updatingSection: true }, () => {
      const data = {location:this.state.value}
      axios.put(`/api/sections/edit/${this.state.id}/`, data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingSection: false, sectionUpdated:true }); this.fetchSections()})
      .catch((err) => this.setState({ updatingSection: false }, () => console.log(err)))
    });
  }

  handleShowEditModal(obj){
    this.setState({ id: obj.id , value: obj.location},()=>{
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
    this.setState({ value: e.target.value });
  }

  toggleTransferData(e){
    this.setState({transferData: !this.state.transferData})
  }

  handleSelect(item){
    this.setState({transferTo:item.location, section:item.id})
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
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <EditSection 
                      show={this.state.show} 
                      onHide={this.handleHideEditModal.bind(this)} 
                      sectionUpdated={this.state.sectionUpdated} 
                      value={this.state.value} 
                      handleTextChange={this.handleTextChange.bind(this)} 
                      updatingSection={this.state.updatingSection}
                      handleEdit={this.handleEdit.bind(this)}
                    />
                    <DeleteSection
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      sectionDeleted={this.state.sectionDeleted}
                      deletingSection={this.state.deletingSection}
                      handleDelete={this.handleDelete.bind(this)}
                      transferData={this.state.transferData}
                      toggle={this.toggleTransferData.bind(this)}
                      sections={this.state.data}
                      id={this.state.id}
                      section={this.state.transferTo}
                      handleSelect={this.handleSelect.bind(this)}
                    />
                    <AddSection
                      show={this.state.show3}
                      onHide={this.handleHideAddModal.bind(this)}
                      sectionAdded={this.state.sectionAdded}
                      addingSection={this.state.addingSection}
                      handleAdd={this.handleAdd.bind(this)}
                      value={this.state.value}
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
