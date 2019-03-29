import React, { Component } from "react";
import { Glyphicon, FormGroup, Checkbox } from "react-bootstrap";

class MCQTypeQuestion extends Component {

  render() {
    return (
        <div>
          <div className="index-head">
            <div className="left">
              <h4>Question : 1</h4>
              <p>Multiple Choice Question</p>
            </div>
            <div className="right">
              <Glyphicon glyph="star"/>
              <p>Marks +5, -2</p>
            </div>
          </div>
          <div className="question">
            <p>Lorem Ipsum is the best text for dummy production though it means nothing still it is best for use i don't know why but it is</p>
          </div>
          <div className="option">
            <FormGroup>
              <Checkbox name="Checkbox" bsClass="my-checkbox">
                This is the first option
                <span className="checkmark"></span>
              </Checkbox> 
              <Checkbox name="Checkbox" bsClass="my-checkbox">
                This is the second option
                <span className="checkmark"></span>
              </Checkbox>
              <Checkbox name="Checkbox" bsClass="my-checkbox">
                This is the third option
                <span className="checkmark"></span>
              </Checkbox>
              <Checkbox name="Checkbox" bsClass="my-checkbox">
                This is the fourth option
                <span className="checkmark"></span>
              </Checkbox>
            </FormGroup>
          </div>
        </div>
    );
  }
}

export default MCQTypeQuestion;
