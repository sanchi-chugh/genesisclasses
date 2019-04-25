import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap"
import appLogo from "../../assets/img/app_logo.png";

class HeaderLinks extends Component {

  logout(){
    this.props.logout(() =>{this.props.history.push('/')})
  }
  render() {
    return (
      <div className="nav-links">
        <ul className="left">
          {this.props.flag && <li href="#">
            <div>
              <img src={appLogo}  style={{
              width: '170px',
              marginTop: '-14px'
            }}/>
            </div>
                    </li>}
          {!this.props.flag && <li href="#">
                      <a ><Glyphicon glyph="menu-hamburger" style={{color:'white', fontSize: '18px'}} onClick={this.props.toggle}/></a>
                    </li>}
          {/*
            <li>
            <a ><Glyphicon glyph="search" style={{color:'white', fontSize: '18px'}}/></a>
          </li>
          */}
        </ul>
        <ul className="right">
          {/*
            <li>
            <a ><Glyphicon glyph="cog" style={{color:'white', fontSize: '18px'}}/></a>
          </li>
          */}
          <li>
            <a ><Glyphicon glyph="log-out" style={{color:this.props.flag ? '#01458E' : 'white', fontSize: '18px'}} onClick={this.logout.bind(this)}/></a>
          </li>
        </ul>
      </div>
    );
  }
}

export default HeaderLinks;
