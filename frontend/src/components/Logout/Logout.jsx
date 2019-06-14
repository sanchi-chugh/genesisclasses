import React, { Component } from "react";
import { Button, 
         Modal, 
         } from "react-bootstrap";

class Logout extends Component {

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
                        Logout
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                       Are you sure you want to log out?
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" onClick={this.props.logout}>Logout</Button>
                </Modal.Footer>
        </Modal>
    );
  }
}

export default Logout;
