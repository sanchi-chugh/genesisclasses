import React, { Component } from "react";
import { Button, 
         Modal } 
         from "react-bootstrap";

import { Checkbox, Menu, Dropdown, Icon } from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../node_modules/antd/dist/antd.css'; 

class DeleteUnit extends Component {

  render() {
    const menu = (
        <Menu>
          {this.props.units.map(item =>{
              if(item.id === this.props.id)
                return null;
              return(
                <Menu.Item key={item.id}>
                    <p onClick={()=> this.props.handleSelect(item)}>{item.title}</p>
                </Menu.Item>
              )
          })}
        </Menu>
      );
    return ( 
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                        DELETE UNIT
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.unitDeleted 
                        ?
                        <center><b><p>Deleted Successully</p></b></center>
                        :
                        <Checkbox onChange={this.props.toggle}>Transfer the Units and Unit-Wise Tests of the unit to be deleted to another unit, otherwise they will be deleted</Checkbox>
                    }
                    <br/>
                    {
                        this.props.transferData ? 
                        <center>
                            <Dropdown overlay={menu}>
                                <a className="ant-dropdown-link">
                                    {this.props.unit} 
                                <Icon type="down" />
                                </a>
                            </Dropdown>
                        </center>
                        : null
                    }
                    <LinearProgress
                        style={
                            this.props.deletingUnit ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.unitDeleted ? null : <Button bsStyle="danger" onClick={this.props.handleDelete}>DELETE UNIT</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default DeleteUnit;
