import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         HelpBlock,
         Row,Col} from "react-bootstrap";

import { Checkbox} from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../node_modules/antd/dist/antd.css'; 

class EditCategories extends Component {

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
                        EDIT CATEGORY
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={this.props.handleEdit}>
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
                        <br/>
                        <ControlLabel>IMAGE</ControlLabel><br/>
                        {   this.props.formData.image === null ? 
                            <Col  md={4}>
                                <p>No Image Available</p>
                            </Col>:
                            <Row md={12}>
                            <Col xs={4}>
                                <a href={this.props.formData.image} target="_blank">{this.props.formData.image.split('/')[5]}</a> 
                            </Col>
                            <Col xs={4}>
                                <Checkbox onChange={this.props.handleFormDataChange} name="clear" >CLEAR</Checkbox><br/>
                            </Col>
                            </Row>
                        }
                        <label className="file">
                            <FormControl
                                type="file"
                                placeholder="Image"
                                value={this.props.formData.newImage}
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
                            this.props.updatingCategories ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.categoryUpdated ? null : <Button bsStyle="primary" type="submit">EDIT CATEGORY</Button>}
                </Modal.Footer>
                </form>
        </Modal>
    );
  }
}

export default EditCategories;
