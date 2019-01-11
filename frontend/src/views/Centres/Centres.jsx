import React, { Component } from "react";
import { Grid, Row, Col, Table } from "react-bootstrap";
import axios from 'axios';

import Card from "../../components/Card/Card.jsx";
import {BootstrapTable, TableHeaderColumn, InsertModalFooter, InsertModalHeader, DeleteButton} from 'react-bootstrap-table';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

class Centres extends Component {

    constructor() {
        super();
        this.state = {
          data: [],
        };
      }

  componentDidMount() {
    axios.get("/api/centres/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
          const data = res.data.map(item => {
          item.sno = res.data.indexOf(item) + 1;
          return item;
        })
        this.setState({data});
    });
  }

  handleDelete = (onClick) => {
    // Custom your onClick event here,
    // it's not necessary to implement this function if you have no any process before onClick
    console.log('This is my custom function for DeleteButton click event');
    onClick();
    this.setState({
      data : [{
        sno:11,
        location:'chandigarh'
      }]
    })
  } 

  handleSave(save) {
    // Custom your onSave event here,
    // it's not necessary to implement this function if you have no any process before save
    this.setState({
      data : [{
        sno:12,
        location:'chandigarh'
      }]
    })
  }

  createCustomModalHeader = (closeModal, save) => {
    return (
      <InsertModalHeader
        className='my-custom-class'
        title='This is my custom title'
        onModalClose={ () => this.handleModalClose(closeModal) }/>
        // hideClose={ true } to hide the close button
    );
  }

  createCustomModalFooter = (closeModal, save) => {
    return (
      <InsertModalFooter
        className='my-custom-class'
        saveBtnText='CustomSaveText'
        closeBtnText='CustomCloseText'
        closeBtnContextual='btn-warning'
        saveBtnContextual='btn-success'
        closeBtnClass='my-close-btn-class'
        saveBtnClass='my-save-btn-class'
        onSave={ () => this.handleSave(save) }/>
    );
  }

  createCustomDeleteButton = (onClick) => {
    return (
      <DeleteButton
        onClick={ e => this.handleDelete(onClick) }/>
    );
  }

  remote(remoteObj) {
      // Only cell editing, insert and delete row will be handled by remote store
      remoteObj.insertRow = true;
      remoteObj.dropRow = true;
      return remoteObj;
  }

  column(cell, row, enumObject, rowIndex) {
    
    return (
       <button 
          type="button" 
          onClick={() => 
            console.log(row,cell,enumObject,rowIndex)}
       >
       Click me { rowIndex }
       </button>
    )
 }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Centres"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <div style={{margin:10}}>
                    <BootstrapTable
                      condensed pagination
                      data={this.state.data}
                      remote={this.remote}
                      search>
                        <TableHeaderColumn dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='location'>Centre</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.column.bind(this)}>Edit/Delete</TableHeaderColumn>
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

export default Centres;
