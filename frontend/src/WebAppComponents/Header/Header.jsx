import React, { Component } from "react";
import { Navbar } from "react-bootstrap";

import HeaderLinks from "./HeaderLinks.jsx";

class Header extends Component {
  constructor(props) {
    super(props);
    this.mobileSidebarToggle = this.mobileSidebarToggle.bind(this);
    this.state = {
      sidebarExists: false
    };
  }
  mobileSidebarToggle(e) {
    if (this.state.sidebarExists === false) {
      this.setState({
        sidebarExists: true
      });
    }
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    var node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function() {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  }
  render() {
    return (
      <Navbar fluid className="nav-bar">
        <Navbar.Header>
          {/* <Navbar.Toggle onClick={this.mobileSidebarToggle} /> */}
        </Navbar.Header>
          <HeaderLinks { ...this.props} />
      </Navbar>
    );
  }
}

export default Header;
