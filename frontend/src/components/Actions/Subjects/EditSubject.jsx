import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         Checkbox,
         Row} from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';

class EditSubject extends Component {

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
                        EDIT SUBJECT
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.subjectUpdated 
                        ?
                        <center><b><p>Updated Successully</p></b></center>
                        :
                    <form>
                        <FormGroup
                        controlId="formBasicText"
                        >
                        <ControlLabel>SUBJECT NAME</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.props.formData.title}
                            placeholder="Subject Name"
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
                        <ControlLabel>Courses</ControlLabel>
                        <FormGroup>
                            {this.props.courses.map((props)=>{
                                return(<Checkbox 
                                            inline
                                            value={props.id}
                                            name='course'
                                            onChange={this.props.handleFormDataChange}
                                        >{props.title}</Checkbox>);
                            })} 
                        </FormGroup>
                        <br/>
                        <ControlLabel>IMAGE</ControlLabel><br/>
                        <a href={this.props.formData.image} target="_blank">{this.props.formData.image.split('/')[2]}</a>{'   '}
                        <Button onClick={this.props.handleFormDataChange} bsSize='small'>Clear</Button>                        
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
                            this.props.updatingSubject ? 
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
                    {this.props.subjectUpdated ? null : <Button bsStyle="primary" onClick={this.props.handleEdit}>EDIT SUBJECT</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default EditSubject;
