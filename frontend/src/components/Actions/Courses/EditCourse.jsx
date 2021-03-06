import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         HelpBlock} from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';

class EditCourse extends Component {

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
                        EDIT COURSE
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={this.props.handleEdit}>
                <Modal.Body>
                        <FormGroup
                        controlId="formBasicText"
                        >
                        <ControlLabel>COURSE NAME</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.props.value}
                            required
                            placeholder="Course Name Cannot Be Empty"
                            onChange={this.props.handleTextChange}
                        />
                        {
                            Object.keys(errors)
                                .some(item=> item === "title") && 
                                    errors.title.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                        </FormGroup>
                        <LinearProgress
                        style={
                            this.props.updatingCourse ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.courseUpdated ? null : <Button bsStyle="primary" type="submit">EDIT COURSE</Button>}
                </Modal.Footer>
                </form>
        </Modal>
    );
  }
}

export default EditCourse;
