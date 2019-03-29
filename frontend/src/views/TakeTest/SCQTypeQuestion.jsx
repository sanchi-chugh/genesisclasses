import React, { Component } from "react";
import { Glyphicon, FormGroup, Radio } from "react-bootstrap";

class SCQTypeQuestion extends Component {

  render() {
    return (
        <div>
          <div className="index-head">
            <div className="left">
              <h4>Question : 1</h4>
              <p>Single choice question</p>
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
              <Radio name="radioGroup" bsClass="my-radio">
                This is the first option
                <span className="checkmark"></span>
              </Radio> 
              <Radio name="radioGroup" bsClass="my-radio">
                This is the second option
                <span className="checkmark"></span>
              </Radio>
              <Radio name="radioGroup" bsClass="my-radio">
                This is the third option
                <span className="checkmark"></span>
              </Radio>
              <Radio name="radioGroup" bsClass="my-radio">
                This is the fourth option
                <span className="checkmark"></span>
              </Radio>
            </FormGroup>
          </div>
        </div>
    );
  }
}

export default SCQTypeQuestion;
