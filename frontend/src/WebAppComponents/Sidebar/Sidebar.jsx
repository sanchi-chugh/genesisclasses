import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";

import webappRoutes from "../../routes/Webapp.jsx";
import appLogo from "../../assets/img/app_logo.png";

class Sidebar extends Component {
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  }
  render() {
    console.log(this.props.user)
    return (
      <div id="side" className={"side" + (this.props.expanded ? " side-expanded" : "")}>
        <div className="logo">
          <img src={appLogo} />
        </div>
        <div className="side-wrapper">
          <div className="profile">
            <div style={{display:'block'}}>
              <span className='avatar'>
                <img src={this.props.user.image !== null ? this.props.user.image : "http://en.imoconsultores.pt/Assets/Images/avatar-placeholder.jpg"} />
              </span>
              <span className='name'>
                <p>{this.props.user.first_name !== null ? this.props.user.first_name :''}{this.props.user.last_name !== null ? ' '+this.props.user.last_name :''}</p>
                <Link to="/editProfile" >Edit Profile</Link>
              </span>
            </div>
          </div>
          <ul className="nav">
            {webappRoutes.map((prop, key) => {
              if (!prop.redirect)
                return (
                  <li
                    className={
                      this.activeRoute(prop.path)
                    }
                    key={key}
                  >
                    <NavLink
                      to={prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                      {/* <i className={prop.icon} /> */}
                      <p>{prop.name}</p>
                    </NavLink>
                  </li>
                );
              return null;
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default Sidebar;
