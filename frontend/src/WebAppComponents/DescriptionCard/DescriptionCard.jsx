import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";

export class DescriptionCard extends Component {
  render() {
    return (
      <div className="card-desc" onClick={this.props.handleClick}>
        <div className="content">
            <Grid fluid>
                <Row>
                    <Col lg={3} md={3}>
                        <div className="image"> 
                            <center><img src={this.props.image} alt=""/></center>
                        </div>
                    </Col>
                    <Col lg={9} md={9}>
                        <div className="description">
                            <h4>{this.props.title}</h4>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam iste quo recusandae temporibus nesciunt! Nemo porro id esse vel laborum voluptas blanditiis omnis sed quae dolore. Ipsum consequuntur maiores et!</p>
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
