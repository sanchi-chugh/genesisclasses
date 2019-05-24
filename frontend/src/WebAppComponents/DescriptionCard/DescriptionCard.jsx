import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";

export class DescriptionCard extends Component {
  render() {
    return (
      <div className="card-desc" onClick={this.props.handleClick}>
        <div className="content">
            <Grid fluid>
                <Row>
                    <Col md={3}>
                        <div className="image"> 
                            <center><img src={this.props.image} alt=""/></center>
                        </div>
                    </Col>
                    <Col md={9}>
                        <div className="description">
                            <h4>{this.props.title}</h4>
                            <p>{this.props.description}</p>
                        </div>
                    </Col>
                </Row>
            </Grid>
            {this.props.content &&
            <div className="info">
                <div id="test-title">{this.props.content.title}</div>
                <p>Max Marks :- {this.props.content.totalMarks}</p>
                <p>Time :- {this.props.content.duration.split(':')[0]+' hrs '+ this.props.content.duration.split(':')[0]+' mins'}</p>
                <p>Number Of Questions :- {this.props.content.totalQuestions}</p>
                <p>End Time :- {this.props.content.endtime}</p>
            </div>
            }
        </div>
      </div>
    );
  }
}

export default DescriptionCard;
