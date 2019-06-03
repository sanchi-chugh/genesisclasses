import React, { Component } from "react";
import {
  FormGroup,
  ControlLabel,
  HelpBlock
} from "react-bootstrap";

import { FormInputs } from "../../../../components/FormInputs/FormInputs.jsx";
import { Editor } from 'react-draft-wysiwyg';

import '../../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../../../../../node_modules/antd/dist/antd.css'; 

class ChoiceType extends Component {

  render() {
    const { errors } = this.props;
    return (
      <div>
         <FormGroup>
            <ControlLabel  className='form-input'>QUESTION *</ControlLabel>
            <Editor
                editorState={this.props.formData.questionText}
                name='questionText'
                editorClassName={'textarea'}
                onEditorStateChange={this.props.onEditorStateChange}
            /><hr/>
            {
                Object.keys(errors)
                        .some(item=> item === "questionText") && 
                            errors.questionText.map(err=>
                                <HelpBlock>{err}</HelpBlock>
                            )
              }
        </FormGroup>
        <FormInputs
            ncols={["col-md-12"]}
            proprieties={[
            {
                label: `Explanation *`,
                componentClass: 'textarea',
                bsClass: "form-control",
                placeholder: "Enter Explanation",
                name:'explanation',
                errors:errors,
                value:this.props.formData.explanation,
                onChange:this.props.handleFormDataChange
            },
            ]}
        />
        <FormInputs
            ncols={["col-md-12"]}
            proprieties={[
                {
                label: "Marks Postive*",
                type: "number",
                bsClass: "form-control",
                placeholder: "4",
                min:'0',
                errors:errors,
                name:'marksPositive',
                value:this.props.formData.marksPositive,
                onChange:this.props.handleFormDataChange
                },
            ]}
          />
        <FormInputs
            ncols={["col-md-12"]}
            proprieties={[
                {
                label: "Marks Negative*",
                type: "number",
                bsClass: "form-control",
                placeholder: "1",
                errors:errors,
                min:'0',
                name:'marksNegative',
                value:this.props.formData.marksNegative,
                onChange:this.props.handleFormDataChange
                },
            ]}
          />
      </div>
    );
  }
}

export default ChoiceType;
