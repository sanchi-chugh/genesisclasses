import React, { Component } from "react";
import { Button, 
         Modal } 
         from "react-bootstrap";

import { Checkbox, Menu, Dropdown, Icon } from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../node_modules/antd/dist/antd.css'; 

class DeleteSubject extends Component {

  render() {
    const menu = (
        <Menu>
          {this.props.subjects.map(item =>{
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
                        DELETE SUBJECT
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.subjectDeleted 
                        ?
                        <center><b><p>Deleted Successully</p></b></center>
                        :
                        <Checkbox onChange={this.props.toggle}>Transfer the Units and Unit-Wise Tests of the subject to be deleted to another subject, otherwise they will be deleted</Checkbox>
                    }
                    <br/>
                    {
                        this.props.transferData ? 
                        <center>
                            <Dropdown overlay={menu}>
                                <a className="ant-dropdown-link">
                                    {this.props.subject} 
                                <Icon type="down" />
                                </a>
                            </Dropdown>
                        </center>
                        : null
                    }
                    <LinearProgress
                        style={
                            this.props.deletingSubject ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.subjectDeleted ? null : <Button bsStyle="danger" onClick={this.props.handleDelete}>DELETE SUBJECT</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default DeleteSubject;
