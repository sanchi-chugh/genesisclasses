import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         DropdownButton,
         MenuItem,
         Col
         } from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';
import InfiniteScroll from 'react-infinite-scroller';
import  './styles.css';

class AddUnits extends Component {
 
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
                        ADD UNIT
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.unitAdded 
                        ?
                        <center><b><p>Added Successfully</p></b></center>
                        :
                    <form>
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
                        <br/>
                        <ControlLabel>DESCRIPTION</ControlLabel>
                        <FormControl
                            componentClass='textarea'
                            bsClass='form-control'
                            value={this.props.formData.description}
                            placeholder="Description"
                            name='description'
                            onChange={this.props.handleFormDataChange}
                        />
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
                            this.props.addingUnit ? 
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
                    {this.props.unitAdded ? null : <Button bsStyle="success" onClick={this.props.handleAdd}>ADD UNIT</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default AddUnits;
