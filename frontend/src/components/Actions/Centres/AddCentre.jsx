import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel} from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';

class AddCentre extends Component {

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
                        ADD CENTRE
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.centreAdded 
                        ?
                        <center><b><p>Added Successfully</p></b></center>
                        :
                    <form>
                        <FormGroup
                        controlId="formBasicText"
                        >
                        <ControlLabel>CENTRE NAME</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.props.value}
                            placeholder="Centre Name Cannot Be Empty"
                            onChange={this.props.handleTextChange}
                        />
                        </FormGroup>
                        <LinearProgress
                        style={
                            this.props.addingCentre ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    </form>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.centreAdded ? null : <Button bsStyle="success" onClick={this.props.handleAdd}>ADD CENTRE</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default AddCentre;
