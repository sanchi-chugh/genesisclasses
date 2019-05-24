import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         HelpBlock} from "react-bootstrap";

import { Editor } from 'react-draft-wysiwyg';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

class EditOption extends Component {

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
                        EDIT OPTION
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={this.props.handleEditOption}>
                    <Modal.Body>
                    <div>
                        <FormGroup>
                            <ControlLabel  className='form-input'>OPTION *</ControlLabel>
                            <Editor
                                editorState={this.props.formData.optionText}
                                name='optionText'
                                editorClassName={'textarea'}
                                onEditorStateChange={this.props.onEditorStateChange}
                            /><hr/>
                            {
                            Object.keys(errors)
                                .some(item=> item === "optionText") && 
                                    errors.optionText.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel  className='form-input'>CORRECT/INCORRECT</ControlLabel>
                            <FormControl
                                componentClass="select"
                                value={this.props.formData.correct} 
                                onChange={this.props.handleFormDataChange} 
                                name="correct">
                                    <option value='true'>CORRECT</option>
                                    <option value='false'>INCORRECT</option>
                            </FormControl>
                            {
                            Object.keys(errors)
                                .some(item=> item === "correct") && 
                                    errors.correct.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                        {
                            Object.keys(errors)
                                .some(item=> item === "question") && 
                                    errors.question.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                        </FormGroup>
                        <LinearProgress
                        style={
                            this.props.updating ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onHide}>CLOSE</Button>
                        {this.props.optionUpdated ? null : <Button bsStyle="success" type="submit">EDIT OPTION</Button>}
                    </Modal.Footer>
                </form>
        </Modal>
    );
  }
}

export default EditOption;
