import React, { Component } from "react";
<<<<<<< HEAD
import { Button, Glyphicon } from "react-bootstrap"
=======

>>>>>>> 75b1cb9dfcd10e9580c46ad9c2cf28f4d60f603b
class HeaderLinks extends Component {

  logout(){
    this.props.logout(() =>{this.props.history.push('/')})
  }
  render() {
    return (
      <div className="nav-links">
        <ul className="left">
          <li href="#">
            <a ><Glyphicon glyph="align-justify" style={{color:'white', fontSize: '18px'}} onClick={this.props.toggle}/></a>
          </li>
          <li>
            <a ><Glyphicon glyph="search" style={{color:'white', fontSize: '18px'}}/></a>
          </li>
        </ul>
        <ul className="right">
          <li>
           <a ><Glyphicon glyph="cog" style={{color:'white', fontSize: '18px'}}/></a>
          </li>
          <li>
            <a ><Glyphicon glyph="log-out" style={{color:'white', fontSize: '18px'}} onClick={this.logout.bind(this)}/></a>
          </li>
        </ul>
      </div>
    );
  }
}

export default HeaderLinks;
