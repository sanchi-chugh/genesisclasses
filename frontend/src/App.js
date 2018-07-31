import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import axios from 'axios';
import Home from './pages/Home';
import Nav from './components/Nav';
import NavDrawer from './components/NavDrawer';
import { loggedIn } from './auth';
import LoginScreen from "./pages/LoginScreen";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import PrivateRoute from './components/PrivateRoute';
import UserTabs from "./components/AddUsers";
import Centres from "./components/Centres";
import Courses from "./components/Courses"

const drawerWidth = 240;
const theme = createMuiTheme({
  palette: {
    primary: {
      main: grey[800],
    },
  },
});

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
  },
  content: {
    flexGrow: 1,
    marginTop: 55,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    overflow: 'scroll',
  },
  content2: {
    flexGrow: 1,
    marginTop: 5,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    overflow: 'scroll',
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false,
      user: null,
    }
    this.getUser = this.getUser.bind(this);
  }

  drawerToggle() {
    this.setState({ drawerOpen: !this.state.drawerOpen });
  }

  componentWillMount() {
    if (loggedIn())
      this.getUser();
  }

  getUser(callBack) {
    axios.get('/api-auth/user/',{
      headers: {Authorization: `Token ${localStorage.token}`}
    })
    .then((res) => {
      this.setState({ user: res.data.profile },
                    () => { 
                      if (callBack)
                        callBack(res.data.profile) 
                    });
    });
  }

  logout(callBack) {
    this.setState({ user: null }, callBack);
  }

  render() {
    const { classes } = this.props;
    const { user } = this.state;
    const isLoggedIn = loggedIn();
    const showNav = isLoggedIn && (user !== null && (user.type !== 'student' || user.complete));
    return (
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <div className={classes.root}>
            {
               showNav ? (
                <div>
                  <Nav
                    handleDrawerToggle={() => this.drawerToggle()}
                    user={this.state.user}
                  />
                  <NavDrawer
                    drawerOpen={this.state.drawerOpen}
                    handleDrawerToggle={() => this.drawerToggle()}
                    user={this.state.user}
                    logout={this.logout.bind(this)}
                  />
                </div>
              ) : ''
            }
            <div className={showNav ? classes.content : classes.content2}>
              <Switch>
                <PrivateRoute
                  authed={isLoggedIn}
                  path='/home'
                  Child={(props) => 
                    <Home {...props} user={this.state.user} />}
                />
                <PrivateRoute
                  authed={isLoggedIn}
                  path="/complete-profile/"
                  Child = {(props) =>
                    <CompleteProfile 
                      {...props} 
                      user={this.state.user}
                      getUser={this.getUser}
                    />
                  }
                />
                <Route path={'/login/'} exact render={(props) => {
                    return !isLoggedIn ?
                      <LoginScreen {...props} getUser={this.getUser} /> :
                      <Redirect to={"/home/"} />
                    } 
                  }
                />
                <Route path={'/forgot-password/'} exact render={(props) => (
                      <ForgotPassword {...props} />
                    )
                  }
                />
                <Route path={'/reset-password/:uid/:token/'} exact render={(props) => (
                      <ResetPassword {...props} />
                    )
                  }
                />
                <Route path={'/users/add/'} exact render={(props) => {
                      return <UserTabs {...props} />
                    }
                  }
                />
                <Route path={'/centres/'} exact render={(props) => {
                      return <Centres {...props} />
                    }
                  }
                />
                <Route path={'/courses/'} exact render={(props) => {
                      return <Courses {...props} />
                    }
                  }
                />
              </Switch>
            </div>
          </div>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles, { withTheme: true })(App);
