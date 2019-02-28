import React, { Component } from "react";
import { Grid } from "react-bootstrap";

class Footer extends Component {
  render() {
    return (
      <footer className="footer footer-custom">
        <Grid fluid>
          <p className="copyright pull-right">
            &copy; {new Date().getFullYear()}{" "}
            <a href="/">Genesis Classes</a>
          </p>
        </Grid>
      </footer>
    );
  }
}

export default Footer;
