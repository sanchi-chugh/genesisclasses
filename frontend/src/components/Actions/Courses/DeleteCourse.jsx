import React, { Component } from "react";
import { Button, 
         Modal } 
         from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';

class DeleteCourse extends Component {

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
                        DELETE COURSE
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.categoryDeleted 
                        ?
                        <center><b><p>Deleted Successully</p></b></center>
                        :
                        <center><b><p>Are You Sure You Want To Proceed ?</p></b></center>
                    }
                    <LinearProgress
                        style={
                            this.props.deletingCourse ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.courseDeleted ? null : <Button bsStyle="danger" onClick={this.props.handleDelete}>DELETE COURSE</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default DeleteCourse;
