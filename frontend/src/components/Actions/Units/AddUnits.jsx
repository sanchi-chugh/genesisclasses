import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         DropdownButton,
         MenuItem,
         Col,
         HelpBlock
         } from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';
import InfiniteScroll from 'react-infinite-scroller';
import  './styles.css';
 
class AddUnits extends Component {
 
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
                        ADD UNIT
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={this.props.handleAdd}>
                <Modal.Body>
                        <FormGroup
                        controlId="formBasicText"
                        >
                        <ControlLabel>UNIT NAME</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.props.formData.title}
                            placeholder="Unit Name"
                            name='title'
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
                        <ControlLabel>DESCRIPTION</ControlLabel>
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
                        <Col md={12} style={{padding:0}}>
                          <FormGroup>
                              <ControlLabel className="form-input">Subjects (Courses)</ControlLabel>
                              <FormControl 
                                componentClass="select" 
                                value={this.props.formData.subject} 
                                onChange={this.props.handleFormDataChange} 
                                name="subject">
                                <option value=''>...</option>
                                {this.props.subjects.map(item=>{
                                return <option value={item.id}>{item.title}</option>;})}   
                              </FormControl>  
                          </FormGroup>
                        </Col>
                        {
                            Object.keys(errors)
                                .some(item=> item === "subject") && 
                                    errors.subject.map(err=>
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
                            this.props.addingUnit ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.unitAdded ? null : <Button bsStyle="success" type="submit">ADD UNIT</Button>}
                </Modal.Footer>
                </form>
        </Modal>
    );
  }
}

export default AddUnits;
