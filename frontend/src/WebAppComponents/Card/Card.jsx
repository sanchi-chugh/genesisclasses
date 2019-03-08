import React, { Component } from "react";

export class Card extends Component {
  render() {
    return (
      <div className="card card-app">
        {this.props.disabled &&
          <div className={"disabled"}>
            <p>Test will start on</p>
            <p>{this.props.content.startTime}</p>
          </div>
        }
          <div className="content" onClick={this.props.handleClick}>
            {this.props.image && 
            <div className="img">
              <img src={this.props.image} alt="placeholder"/>
            </div>
            }
            {this.props.content &&
            <div className="info">
              <div id="test-title">{this.props.content.title}</div>
              <p>Max Marks :- {this.props.content.totalMarks}</p>
              <p>Time :- {this.props.content.duration.split(':')[0]+' hrs '+ this.props.content.duration.split(':')[0]+' mins'}</p>
              <p>Number Of Questions :- {this.props.content.totalQuestions}</p>
              <p>End Time :- {this.props.content.endtime}</p>
            </div>
            }
            <div className="footer">
              <div className={"title "+this.props.color}>
                {this.props.title} {this.props.subTitle}
              </div>
            </div>
          </div>
      </div>
    );
  }
}

export default Card;
