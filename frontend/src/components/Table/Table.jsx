import React, { Component } from "react";
import {BootstrapTable, TableHeaderColumn, InsertModalFooter, InsertModalHeader, DeleteButton} from 'react-bootstrap-table';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import Axios from "axios";

class Table extends Component {

//---------------------------------------------------------------------------------
//  custom footer
      constructor() {
        super();
        this.state = {
          data: null,
        };
      }

      componentDidMount() {
        Axios.get("/api/centres/", {
            headers: {
            Authorization: `Token ${localStorage.token}`
            }
        }).then(res => {
            console.log(res.data);
            const data = res.data;
            this.setState({data});
        });
      }

      handleModalClose(closeModal) {
        // Custom your onCloseModal event here,
        // it's not necessary to implement this function if you have no any process before modal close
        console.log('This is my custom function for modal close event');
        closeModal();
      }

      handleSave(save) {
        // Custom your onSave event here,
        // it's not necessary to implement this function if you have no any process before save
        console.log('This is my custom function for save event');
        this.props.update();
        this.setState({
          data : [{
            sno:12,
            location:'chandigarh'
          }]
        })
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
            onModalClose={ () => this.handleModalClose(closeModal) }
            onSave={ () => this.handleSave(save) }/>
          );
        }

    //---------------------------------------------------------------------------------
    //  custom header


    createCustomModalHeader = (closeModal, save) => {
        return (
          <InsertModalHeader
            className='my-custom-class'
            title='This is my custom title'
            onModalClose={ () => this.handleModalClose(closeModal) }/>
            // hideClose={ true } to hide the close button
        );
      }
    
    //  custom delete button
    handleDeleteButtonClick = (onClick) => {
      // Custom your onClick event here,
      // it's not necessary to implement this function if you have no any process before onClick
      console.log('This is my custom function for DeleteButton click event');
      alert('hehe')
      onClick();
      this.setState({
        data : [{
          sno:11,
          location:'chandigarh'
        }]
      })
    }
  
    createCustomDeleteButton = (onClick) => {
        return (
          <DeleteButton
            onClick={ e => this.handleDeleteButtonClick(onClick) }/>
        );
    }

    render() {
      const options = {
          insertModalHeader: this.createCustomModalHeader,
          insertModalFooter: this.createCustomModalFooter,
          deleteBtn: this.createCustomDeleteButton
      };
      return (
          <div style={{margin:10}}>
            <BootstrapTable
              condensed pagination
              data={this.state.data}
              remote
              options={ options }
              insertRow={ true }
              search={ true }
              deleteRow={ true }>
                <TableHeaderColumn dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                <TableHeaderColumn dataField='location'>Centre</TableHeaderColumn>
            </BootstrapTable>
          </div>
      );
    }
  }
  
export default Table;
