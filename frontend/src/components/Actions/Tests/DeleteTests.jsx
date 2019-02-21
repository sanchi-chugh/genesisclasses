import React, { Component } from "react";
import { Button, 
         Modal } 
         from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';

class DeleteTest extends Component {

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
                        DELETE TEST
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.testDeleted 
                        ?
                        <center><b><p>Deleted Successully</p></b></center>
                        :
                        <center><b><p>Are you sure you want to delete this test? All the questions and sections in this test will be deleted.</p></b></center>
                    }
                    <LinearProgress
                        style={
                            this.props.deletingTest ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.testDeleted ? null : <Button bsStyle="danger" onClick={this.props.handleDelete}>DELETE TEST</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default DeleteTest;
