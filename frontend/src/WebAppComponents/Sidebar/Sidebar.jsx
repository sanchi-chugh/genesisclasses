import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import webappRoutes from "../../routes/Webapp.jsx";

class Sidebar extends Component {
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  }
  render() {
    return (
      <div id="side" className="side">
        <div className="logo">
          <p>LOGO HERE</p>
        </div>
        <div className="side-wrapper">
          <div className="profile">
            <p>profile</p>
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
