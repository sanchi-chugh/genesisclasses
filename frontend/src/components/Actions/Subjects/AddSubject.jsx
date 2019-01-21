import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         } from "react-bootstrap";

import { Checkbox} from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../node_modules/antd/dist/antd.css'; 

class AddSubject extends Component {

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
                        ADD SUBJECT
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.subjectAdded 
                        ?
                        <center><b><p>Added Successfully</p></b></center>
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
                            this.props.addingSubject ? 
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
                    {this.props.subjectAdded ? null : <Button bsStyle="success" onClick={this.props.handleAdd}>ADD SUBJECT</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default AddSubject;
