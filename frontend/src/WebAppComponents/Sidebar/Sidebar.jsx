import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";
import { Glyphicon } from "react-bootstrap";
import webappRoutes from "../../routes/Webapp.jsx";
import appLogo from "../../assets/img/app_logo.png";
import avatar from "../../assets/img/avatar-placeholder.jpg";

class Sidebar extends Component {
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  }
  render() {
    return (
      <div id="side" className={"side" + (this.props.expanded ? " side-expanded" : "")}>
        <div className="logo">
          <img src={appLogo} />
        </div>
        <div className="side-wrapper">
          <div className="profile">
            <div style={{display:'block'}}>
              <span className='avatar'>
                <img src={this.props.user.image !== null ? this.props.user.image : avatar} />
              </span>
              <span className='name'>
                <p>{this.props.user.first_name !== null ? this.props.user.first_name :''}{this.props.user.last_name !== null ? ' '+this.props.user.last_name :''}</p>
                <Link to="/home/editProfile" >Edit Profile</Link>
              </span>
            </div>
          </div>
          <ul className="nav">
            {webappRoutes.slice().reverse().map((prop, key) => {
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
                      <Glyphicon glyph={prop.icon} />
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
