import React, { Component } from "react";
import { Button, 
         Modal } 
         from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';

class DeleteStudent extends Component {

  render() {

    return ( 
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                        DELETE STUDENT
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.studentDeleted 
                        ?
                        <center><b><p>Deleted Successully</p></b></center>
                        :
                        <center><b><p>Are You Sure You Want To Proceed ?</p></b></center>
                    }
                    <LinearProgress
                        style={
                            this.props.deletingStudent ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.studentDeleted ? null : <Button bsStyle="danger" onClick={this.props.handleDelete}>DELETE STUDENT</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default DeleteStudent;
