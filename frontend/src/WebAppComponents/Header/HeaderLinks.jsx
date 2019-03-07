import React, { Component } from "react";
import { NavItem, Nav} from "react-bootstrap";

class HeaderLinks extends Component {

  logout(){
    this.props.logout(() =>{this.props.history.push('/')})
  }
  render() {
    return (
      <div className="nav-links">
        <Nav>
          <NavItem eventKey={1} href="#">
            Toggle
          </NavItem>
          <NavItem eventKey={2}>
            Search
          </NavItem>
        </Nav>
        <Nav pullRight>
          <NavItem eventKey={3} href="#">
            Settings
          </NavItem>
          <NavItem eventKey={4} onClick={this.logout.bind(this)}>
            Log Out
          </NavItem>
        </Nav>
      </div>
    );
  }
}

export default HeaderLinks;
