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
import EditCentre from "../../components/Actions/Centres/EditCentre";
import DeleteCentre from "../../components/Actions/Centres/DeleteCentre";
import AddCentre from "../../components/Actions/Centres/AddCentre";

class Centres extends Component {

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
          updatingCentre:false,
          centreUpdated:false,
          centreDeleted:false,
          deletingCentre:false,
          transferData:false,
          centre:'',
          centreAdded:false,
          addingCentre:false,
          errors:{}
        };
      }
  
  componentDidMount() {
   this.fetchCentres();
  }

  fetchCentres(){
    axios.get("/api/centres/", {
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
    this.setState({ show: false, updatingCentre:false, centreUpdated:false, value:'', errors:{}});
  }

  handleHideAddModal() {
    this.setState({ show3: false, addingCentre:false, centreAdded:false,value:'', errors:{}});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingCentre:false, centreDeleted:false, transferData:false, centre:'', errors:{}});
  }

  handleAdd(e){
    e.preventDefault();
    this.setState({ addingCentre: true }, () => {
      const data = {location:this.state.value}
      axios.post('/api/centres/add/', data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {
        this.setState({ addingCentre: false, centreAdded:true }, this.fetchCentres()); 
        this.props.handleClick('tr','Added Successfully');
        this.handleHideAddModal();
      })
      .catch((err) => this.setState({ addingCentre: false, errors: err.response.data }, () => console.log(err)))
    });
  }

  handleDelete = (e) => {
    e.preventDefault();
    this.setState({ deletingCentre: true }, () => {
      if(this.state.transferData){
        const data = {data:{ "centre" : this.state.centre }};
        axios.delete(`/api/centres/delete/${this.state.id}/`, data , {
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingCentre: false, centreDeleted:true, transferData:false},this.fetchCentres());
            this.props.handleClick('tr','Deleted Successfully');
            this.handleHideDeleteModal();
          })
          .catch((err) => this.setState({ deletingCentre: false }, () => console.log(err)))
      }else{
        axios.delete(`/api/centres/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            
            this.setState({ deletingCentre: false,centreDeleted:true, transferData:false},()=>{
              this.fetchCentres();
              this.props.handleClick('tr','Deleted Successfully');
              this.handleHideDeleteModal();
            })
          })
          .catch((err) => this.setState({ deletingCentre: false, errors:err.response.data }, () => console.log(err)))
      }
    });
  } 

  handleEdit(e) {
    e.preventDefault();
    this.setState({ updatingCentre: true }, () => {
      const data = {location:this.state.value}
      axios.put(`/api/centres/edit/${this.state.id}/`, data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {
        this.setState({ updatingCentre: false, centreUpdated:true }); this.fetchCentres();
        this.props.handleClick('tr','Updated Successfully');
        this.handleHideEditModal();
      })
      .catch((err) => this.setState({ updatingCentre: false, errors: err.response.data }, () => console.log(err)))
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
    this.setState({ value: e.target.value.trimLeft() });
  }

  toggleTransferData(e){
    this.setState({transferData: !this.state.transferData})
  }

  handleSelect(e){
    this.setState({centre:e.target.value})
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
                title="Centres"
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
                        <TableHeaderColumn dataField='location'>Centre</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <EditCentre 
                      show={this.state.show} 
                      onHide={this.handleHideEditModal.bind(this)} 
                      centreUpdated={this.state.centreUpdated} 
                      value={this.state.value} 
                      handleTextChange={this.handleTextChange.bind(this)} 
                      updatingCentre={this.state.updatingCentre}
                      handleEdit={this.handleEdit.bind(this)}
                      errors={this.state.errors}
                    />
                    <DeleteCentre
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      centreDeleted={this.state.centreDeleted}
                      deletingCentre={this.state.deletingCentre}
                      handleDelete={this.handleDelete.bind(this)}
                      transferData={this.state.transferData}
                      toggle={this.toggleTransferData.bind(this)}
                      centres={this.state.data}
                      id={this.state.id}
                      centre={this.state.transferTo}
                      handleSelect={this.handleSelect.bind(this)}
                      errors={this.state.errors}
                    />
                    <AddCentre
                      show={this.state.show3}
                      onHide={this.handleHideAddModal.bind(this)}
                      centreAdded={this.state.centreAdded}
                      addingCentre={this.state.addingCentre}
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

export default Centres;
