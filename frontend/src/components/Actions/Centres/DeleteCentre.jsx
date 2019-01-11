import React, { Component } from "react";
import { Button, 
         Modal } 
         from "react-bootstrap";

import { Checkbox, Menu, Dropdown, Icon } from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../node_modules/antd/dist/antd.css'; 

class DeleteCentre extends Component {

  render() {
    const menu = (
        <Menu>
          {this.props.centres.map(item =>{
              if(item.id === this.props.id)
                return null;
              return(
                <Menu.Item key={item.id}>
                    <p onClick={()=> this.props.handleSelect(item)}>{item.location}</p>
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
                        DELETE CENTRE
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.centreDeleted 
                        ?
                        <center><b><p>Deleted Successully</p></b></center>
                        :
                        <Checkbox onChange={this.props.toggle}>Shift the staff users and students of the centre to be deleted to another centre.</Checkbox> 
                    }
                    {
                        this.props.transferData ? 
                        <center>
                            <Dropdown overlay={menu}>
                                <a className="ant-dropdown-link">
                                    {this.props.centre} 
                                <Icon type="down" />
                                </a>
                            </Dropdown>
                        </center>
                        : null
                    }
                    <LinearProgress
                        style={
                            this.props.deletingCentre ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.centreDeleted ? null : <Button bsStyle="danger" onClick={this.props.handleDelete}>DELETE CENTRE</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default DeleteCentre;
