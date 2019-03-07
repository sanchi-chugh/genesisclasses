import React, { Component } from "react";

export class Card extends Component {
  render() {
    return (
      <div className="card card-app">
        <div className="content">
          <div className="img">
            <img src={this.props.image} alt="placeholder"/>
          </div>
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
