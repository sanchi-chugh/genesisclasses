import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         } from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';

class AddCategories extends Component {

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
                        ADD CATEGORY
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.categoryAdded 
                        ?
                        <center><b><p>Added Successfully</p></b></center>
                        :
                    <form>
                        <FormGroup
                        controlId="formBasicText"
                        >
                        <ControlLabel>CATEGORY NAME</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.props.formData.title}
                            placeholder="Categories Name"
                            name='title'
                            onChange={this.props.handleFormDataChange}
                        />
                        <br/>
                        <ControlLabel>DESCRIPTION</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.props.formData.description}
                            placeholder="Description"
                            name='description'
                            onChange={this.props.handleFormDataChange}
                        />
                        <br/>
                        <ControlLabel>IMAGE</ControlLabel>
                        <FormControl
                            type="file"
                            placeholder="Image"
                            name='image'
                            onChange={this.props.handleFormDataChange}
                        />
                        </FormGroup>
                        <LinearProgress
                        style={
                            this.props.addingCategories ? 
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
                    {this.props.categoryAdded ? null : <Button bsStyle="success" onClick={this.props.handleAdd}>ADD CATEGORY</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default AddCategories;
