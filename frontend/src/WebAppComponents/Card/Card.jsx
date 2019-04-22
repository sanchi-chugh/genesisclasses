import React, { Component } from "react";
import moment from 'moment';

export class Card extends Component {

  render() {
    console.log(this.props)
    return (
      <div className="card card-app">
          <div className={"content " + (this.props.disabled ? 'disabled' : '')} onClick={()=>{
            if(!this.props.disabled)
                this.props.handleClick();
          }}>
            {this.props.image && 
            <div className="img">
              <img src={this.props.image} alt="placeholder"/>
            </div>
            }
            {this.props.content &&
            <div className="info">
              <div id="test-title">{this.props.content.title}</div>
              <div className="details">
                <div className="key">
                  Total Marks
                </div>
                <div className="value">
                  {this.props.content.totalMarks}
                </div>
              </div>

              <div className="details">
                <div className="key">
                  Duration
                </div>
                <div className="value">
                  {parseInt(this.props.content.duration.split(':')[0]) * 60 + parseInt(this.props.content.duration.split(':')[1]) } mins
                </div>
              </div>

              <div className="details">
                <div className="key">
                  No. of questions
                </div>
                <div className="value">
                  {this.props.content.totalQuestions}
                </div>
              </div>

              {this.props.disabled ?
                <div>
                  <div className="details">
                    <div className="key">
                      Start Date
                    </div>
                    <div className="value">
                      {
                        this.props.content.startTime ?
                        moment(new Date(this.props.content.startTime)).format("MMM DD, YYYY")
                        :'...'}
                    </div>
                  </div>

                  <div className="details">
                    <div className="key">
                      Start Time
                    </div>
                    <div className="value">
                      {
                        this.props.content.startTime ?
                        this.props.content.startTime.split("(")[1].split(")")[0]
                        : '...'}
                    </div>
                  </div>
                </div>
                 :
                <div>
                  <div className="details">
                    <div className="key">
                      End Date
                    </div>
                    <div className="value">
                      {
                        this.props.content.endtime ?
                        moment(new Date(this.props.content.endtime)).format("MMM DD, YYYY")
                        :'...'}
                    </div>
                  </div>

                  <div className="details">
                    <div className="key">
                      End Time
                    </div>
                    <div className="value">
                      {
                        this.props.content.endtime ?
                        this.props.content.endtime.split("(")[1].split(")")[0]
                        : '...'}
                    </div>
                </div>
                </div>
              }
            </div>
            }
            <div className="footer">
              {this.props.title ?
                <div className={"title "+this.props.color}>
                  {this.props.title}
                </div> : null
              }
              {this.props.subTitle ?
                <div className={"sub-title "+this.props.color}>
                  {this.props.subTitle}
                </div> : null
              }
            </div>
          </div>
      </div>
    );
  }
}

export default Card;
