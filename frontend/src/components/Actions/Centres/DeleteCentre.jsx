import React, { Component } from "react";
import { Button, 
         Modal } 
         from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';

class DeleteCentre extends Component {

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
                        DELETE CENTRE
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.centreDeleted 
                        ?
                        <center><b><p>Deleted Successully</p></b></center>
                        :
                        null
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.centreDeleted ? null : <Button bsStyle="danger" onClick={this.props.handleEdit}>DELETE CENTRE</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default DeleteCentre;
