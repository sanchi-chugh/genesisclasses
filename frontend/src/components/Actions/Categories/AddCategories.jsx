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
    const { errors } = this.props;
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
                        {
                            Object.keys(errors)
                                .some(item=> item === "title") && 
                                    errors.title.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
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
                        {
                            Object.keys(errors)
                                .some(item=> item === "description") && 
                                    errors.description.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                        <br/>
                        <ControlLabel>IMAGE</ControlLabel>
                        <label className="file">
                            <FormControl
                                type="file"
                                placeholder="Image"
                                name='image'
                                onChange={this.props.handleFormDataChange}
                            />
                            <span className="file-custom"><span id="text">Choose Image...</span></span>
                        </label>
                        {
                            Object.keys(errors)
                                .some(item=> item === "image") && 
                                    errors.image.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
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
