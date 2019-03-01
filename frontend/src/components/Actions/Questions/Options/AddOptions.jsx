import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel} from "react-bootstrap";

import { Editor } from 'react-draft-wysiwyg';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

class AddOption extends Component {

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
                        ADD OPTION
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={this.props.handleAdd}>
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
                        </FormGroup>
                        <LinearProgress
                        style={
                            this.props.addingOption ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onHide}>CLOSE</Button>
                        {this.props.optionAdded ? null : <Button bsStyle="success" type="submit">ADD OPTION</Button>}
                    </Modal.Footer>
                </form>
        </Modal>
    );
  }
}

export default AddOption;
