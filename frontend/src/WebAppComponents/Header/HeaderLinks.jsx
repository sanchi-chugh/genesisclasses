import React, { Component } from "react";

class HeaderLinks extends Component {

  logout(){
    this.props.logout(() =>{this.props.history.push('/')})
  }
  render() {
    return (
      <div className="nav-links">
        <ul className="left">
          <li href="#">
            <a>Toggle</a>
          </li>
          <li>
            <a>Search</a>
          </li>
        </ul>
        <ul className="right">
          <li href="#">
            <a>Settings</a>
          </li>
          <li>
            <a onClick={this.logout.bind(this)}>Log Out</a>
          </li>
        </ul>
      </div>
    );
  }
}

export default HeaderLinks;
