import React, { Component } from "react";
import { Grid, 
  Row, 
  Col, 
  Button, 
  Glyphicon, 
} from "react-bootstrap";

export class QuestionCard extends Component {
  render() {
    return (
      <div className={"card ques-card" + (this.props.plain ? " card-plain" : "")}>
        <div
          className={"content ques-content"}
        >
          {this.props.content}
        </div>
      </div>
    );
  }
}

export default QuestionCard;
