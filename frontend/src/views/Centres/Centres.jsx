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
import EditCentre from "../../components/Actions/Centres/EditCenter";
import DeleteCentre from "../../components/Actions/Centres/DeleteCentre";

class Centres extends Component {

    constructor() {
        super();
        this.handleTextChange = this.handleTextChange.bind(this);
        this.state = {
          data: [],
          show: false,//edit modal
          show2:false,//delete modal
          value: '',
          id:null,
          updatingCentre:false,
          centreUpdated:false,
          centreDeleted:false,
          deletingCentre:false
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
    this.setState({ show: false, updatingCentre:false, centreUpdated:false});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingCentre:false, centreDeleted:false});
  }

  handleDelete = (id) => {
  } 

  handleEdit() {
    this.setState({ updatingCentre: true }, () => {
      const data = {location:this.state.value}
      axios.put(`/api/centres/edit/${this.state.id}/`, data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingCentre: false, centreUpdated:true }); this.fetchCentres()})
      .catch((err) => this.setState({ updatingCentre: false }, () => console.log(err)))
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

  handleTextChange(e) {
    this.setState({ value: e.target.value });
  }

  toggleTransferData(){
    this.setState({transferData:!this.state.transferData})
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
                    />
                    <DeleteCentre
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      centreDeleted={this.state.centreDeleted}
                      deletingCentre={this.state.deletingCentre}
                      handleDelete={this.handleDelete.bind(this)}
                      transferData={this.state.tranferData}
                      toggle={this.toggleTransferData.bind(this)}
                      centres={this.state.data}
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
