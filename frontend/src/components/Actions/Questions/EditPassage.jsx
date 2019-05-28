import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         ControlLabel, HelpBlock} from "react-bootstrap";

import { Editor } from 'react-draft-wysiwyg';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

class EditPassage extends Component {

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
                        EDIT PARAGRAPH
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={this.props.handleEdit}>
                    <Modal.Body>
                    <div>
                        <FormGroup>
                            <ControlLabel  className='form-input'>PARAGRAPH *</ControlLabel>
                            <Editor
                                editorState={this.props.formData.passage}
                                name='passageText'
                                editorClassName={'textarea'}
                                onEditorStateChange={this.props.onEditorStateChange}
                            /><hr/>
                             {
                            Object.keys(errors)
                                .some(item=> item === "passageText") && 
                                    errors.passageText.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                        </FormGroup>
                        <LinearProgress
                        style={
                            this.props.addingPassage ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onHide}>CLOSE</Button>
                        {this.props.passageAdded ? null : <Button bsStyle="success" type="submit">EDIT PARAGRAPH</Button>}
                    </Modal.Footer>
                </form>
        </Modal>
    );
  }
}

export default EditPassage;
