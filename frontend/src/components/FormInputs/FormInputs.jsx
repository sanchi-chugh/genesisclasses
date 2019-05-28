import React, { Component } from "react";
import { FormGroup, ControlLabel, FormControl, Row, HelpBlock } from "react-bootstrap";

function FieldGroup({ label, ...props }) {
  return (
    <FormGroup>
      <ControlLabel className='form-input'>{label}</ControlLabel>
      <FormControl {...props} />
      {
        props.errors !== null && props.errors !== undefined ? 
          Object.keys(props.errors)
              .some(item=> item === props.name) && 
                  props.errors[props.name].map(err=>
                      <HelpBlock>{err}</HelpBlock>
                  ) : ''
      }
    </FormGroup>
  );
}

export class FormInputs extends Component {
  render() {
    var row = [];
    for (var i = 0; i < this.props.ncols.length; i++) {
      row.push(
        <div key={i} className={this.props.ncols[i]}>
          <FieldGroup {...this.props.proprieties[i]} />
        </div>
      );
    }
    return (
          <Row>
            {row}
            {this.props.contents}
          </Row>
    );
  }
}

export default FormInputs;
