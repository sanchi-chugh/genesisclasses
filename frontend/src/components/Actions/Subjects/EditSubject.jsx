import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         Row,Col,
         HelpBlock} from "react-bootstrap";

import { Checkbox} from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';
 
import '../../../../node_modules/antd/dist/antd.css'; 

class EditSubject extends Component {

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
                        EDIT SUBJECT
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                        <ControlLabel>Courses</ControlLabel>
                        <FormGroup>
                            {this.props.courses.map((props)=>{
                                return(<Checkbox 
                                            style={{marginLeft:8}}
                                            inline
                                            value={props.id}
                                            checked={
                                                this.props.formData.course.indexOf(props.id) !== -1
                                              }
                                            name='course'
                                            onChange={this.props.handleFormDataChange}
                                        >{props.title}</Checkbox>);
                            })} 
                        {
                            Object.keys(errors)
                                .some(item=> item === "course") && 
                                    errors.course.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                        </FormGroup>
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
                            this.props.updatingSubject ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    </form>
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
