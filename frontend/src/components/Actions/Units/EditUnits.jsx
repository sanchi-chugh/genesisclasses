import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         Row,Col,
         DropdownButton,
         MenuItem} from "react-bootstrap";
import { Checkbox} from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';
import InfiniteScroll from 'react-infinite-scroller';

import  './styles.css';
import '../../../../node_modules/antd/dist/antd.css'; 

class EditUnit extends Component {

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
                        EDIT UNIT
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.unitUpdated 
                        ?
                        <center><b><p>Updated Successully</p></b></center>
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
                            type="text"
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
                        <ControlLabel>IMAGE</ControlLabel><br/>
                        {   this.props.formData.image === null ? 
                            <Col  md={4}>
                                <p>No Image Available</p>
                            </Col>:
                            <Row md={12}>
                            <Col xs={4}>
                                <a href={this.props.formData.image} target="_blank">{this.props.formData.image.split('/')[4]}</a> 
                            </Col>
                            <Col xs={4}>
                                <Checkbox onChange={this.props.handleFormDataChange} name="clear" >CLEAR</Checkbox><br/>
                            </Col>
                            </Row>
                        }
                        <FormControl
                            type="file"
                            value={this.props.formData.newImage}
                            placeholder="Image"
                            name='image'
                            onChange={this.props.handleFormDataChange}
                        />
                        </FormGroup>
                        <LinearProgress
                        style={
                            this.props.updatingUnit ? 
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
                    {this.props.unitUpdated ? null : <Button bsStyle="primary" onClick={this.props.handleEdit}>EDIT UNIT</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default EditUnit;
