import React, { Component } from "react";
import { NavItem, Nav, NavDropdown, MenuItem } from "react-bootstrap";
import Logout from '../Logout/Logout';

class HeaderLinks extends Component {

  constructor(props){
    super(props);
    this.state = {
      show:false
    }
  }

  logout(){
    this.props.logout(() =>{this.props.history.push('/')})
  }
  render() {
    const notification = (
      <div>
        <i className="fa fa-globe" />
        <b className="caret" />
        <span className="notification">5</span>
        <p className="hidden-lg hidden-md">Notification</p>
      </div>
    );
    return (
      <div>
        <Nav>
          <NavItem eventKey={1} href="#">
            <i className="fa fa-dashboard" />
            <p className="hidden-lg hidden-md">Dashboard</p>
          </NavItem>
          {/*<NavItem eventKey={3} href="#">
                      <i className="fa fa-search" />
                      <p className="hidden-lg hidden-md">Search</p>
                    </NavItem>*/}
        </Nav>
        <Nav pullRight>
          {/*<NavItem eventKey={1} href="#">
                      Profile
                    </NavItem>*/}
          <NavItem eventKey={3} onClick={()=>this.setState({show:true})}>
            Log out
          </NavItem>
        </Nav>
        <Logout
         onHide={()=>this.setState({show:false})}
         show={this.state.show}
         logout={this.logout.bind(this)}
         />
      </div>
    );
  }
}

export default HeaderLinks;
