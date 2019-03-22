import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         HelpBlock
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
                <form onSubmit={this.props.handleAdd}>
                <Modal.Body>
                        <FormGroup
                        controlId="formBasicText"
                        >
                        <ControlLabel>CATEGORY NAME *</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.props.formData.title}
                            placeholder="Categories Name"
                            name='title'
                            required
                            onChange={this.props.handleFormDataChange}
                        />
                        {this.props.err !== null ? <HelpBlock>{this.props.err.message}</HelpBlock> : null}
                        <br/>
                        <ControlLabel>DESCRIPTION </ControlLabel>
                        <FormControl
                            type="text"
                            rows="3"
                            componentClass="textarea"
                            bsClass="form-control"
                            value={this.props.formData.description}
                            placeholder="Description..."
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
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.categoryAdded ? null : <Button bsStyle="success" type="submit">ADD CATEGORY</Button>}
                </Modal.Footer>
                </form>
        </Modal>
    );
  }
}

export default AddCategories;
