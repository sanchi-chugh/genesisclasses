import React, { Component } from "react";
import {BootstrapTable, TableHeaderColumn, InsertModalFooter, InsertModalHeader, DeleteButton} from 'react-bootstrap-table';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

class Table extends Component {

//---------------------------------------------------------------------------------
//  custom footer

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
        save();
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
            condensed
            data={this.props.data}
            pagination
            options={ options }
            insertRow={ true }
            search={ true }
            deleteRow={ true }>
              <TableHeaderColumn dataField='id' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
              <TableHeaderColumn dataField='location'>Centre</TableHeaderColumn>
          </BootstrapTable>
          </div>
      );
    }
  }
  
export default Table;
