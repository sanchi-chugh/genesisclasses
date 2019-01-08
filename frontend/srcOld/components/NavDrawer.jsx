import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import SuperAdminMenu from './menus/SuperAdminMenu';
import StaffMenu from './menus/StaffMenu';
import StudentMenu from './menus/StudentMenu';

const drawerWidth = 240;

const styles = theme => ({
  drawerPaper: {
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
  },
  logo: {
    height: 54,
    textAlign: 'center',
    paddingTop: 10,
  },
});

class NavDrawer extends Component {
  goToPath(path) {
    this.props.handleDrawerToggle();
    this.props.history.push(path);
  }

  logout() {
    this.props.logout(() => this.goToPath('/login/'));
  }

  render() {
    const { classes, theme } = this.props;

    const drawer = (
      <div>
        <div className={classes.toolbar} />
          <div className={classes.logo}>
            <Typography variant="display1">
              Logo
            </Typography>
          </div>        
        <Divider />
        {
          this.props.user ? (
            {
              'superadmin': <SuperAdminMenu logout={this.logout.bind(this)} />,
              'staff': <StaffMenu logout={this.logout.bind(this)} />,
              'student': <StudentMenu logout={this.logout.bind(this)} />,
            }[this.props.user.type]
          ) : ''
        }
      </div>
    );
    return (
      <div>
        <Hidden mdUp>
          <SwipeableDrawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={this.props.drawerOpen}
            onClose={() => this.props.handleDrawerToggle()}
            onOpen={() => this.props.handleDrawerToggle()}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </SwipeableDrawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
      </div>
    );
  }
}

export default withRouter(withStyles(styles, { withTheme: true })(NavDrawer));
