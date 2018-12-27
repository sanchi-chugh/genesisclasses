import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import axios from 'axios';
import Home from './pages/Home';
import Nav from './components/Nav';
import NavDrawer from './components/NavDrawer';
import LoginScreen from "./pages/LoginScreen";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import PrivateRoute from './components/PrivateRoute';
import UserTabs from "./components/AddUsers";
import AddCentres from "./components/AddCentres";
import EditCentre from "./components/EditCentre";
import Centres from "./components/Centres";
import Courses from "./components/Courses";
import AddTest from "./pages/AddTest";
import FromDoc from "./components/FromDoc";
import AddTestManually from "./components/AddTestManually";
import Error404 from './pages/Error404';
import EditTest from './pages/EditTest';
import StaffUsers from './pages/StaffUsers';
import StudentUsers from './pages/StudentUsers';
import TestList from './pages/TestList';

import './App.css';

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
    marginTop: 62,
    backgroundColor: theme.palette.background.default,
    overflow: 'scroll',
  },
  content2: {
    flexGrow: 1,
    marginTop: 5,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    overflow: 'scroll',
  },
  loader: {

  },
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false,
      user: null,
      busy: true,
    }
    this.getUser = this.getUser.bind(this);
  }

  drawerToggle() {
    this.setState({ drawerOpen: !this.state.drawerOpen });
  }

  componentWillMount() {
    this.setState({ busy: true }, () => this.getUser());
  }

  getUser(callBack) {
    axios.get('/api-auth/user/',{
      headers: {Authorization: `Token ${localStorage.token}`}
    })
    .then((res) => {
      this.setState({ user: res.data.profile, busy: false },
                    () => {
                      if (callBack)
                        callBack(res.data.profile)
                    });
    })
    .catch((err) => {
      delete localStorage.token;
      this.setState({ busy: false });
    });
  }

  logout(callBack) {
    delete localStorage.token;
    this.setState({ user: null }, callBack);
  }

  render() {
    const { classes } = this.props;
    const { user } = this.state;
    const isLoggedIn = this.state.user !== null;
    const showNav = (user !== null && (user.type !== 'student' || user.complete));

    if (this.state.user === null && this.state.busy) {
      return (
        <center><div className="loader"></div></center>
      );
    }
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
                <PrivateRoute
                  authed={isLoggedIn}
                  path="/tests/edit/:id/"
                  Child = {(props) =>
                    <EditTest
                      {...props}
                      user={this.state.user}
                    />
                  }
                />
                <PrivateRoute
                  authed={isLoggedIn}
                  path="/tests/add/from-doc/"
                  Child = {(props) =>
                    <FromDoc
                      {...props}
                      user={this.state.user}
                    />
                  }
                />
                <PrivateRoute
                  authed={isLoggedIn}
                  path="/tests/add/manual/"
                  Child = {(props) =>
                    <AddTestManually
                      {...props}
                      user={this.state.user}
                    />
                  }
                />
                <PrivateRoute
                  authed={isLoggedIn}
                  path="/tests/add/"
                  Child = {(props) =>
                    <AddTest
                      {...props}
                      user={this.state.user}
                    />
                  }
                />
                <PrivateRoute
                  authed={isLoggedIn}
                  path="/users/staff/"
                  Child = {(props) =>
                    <StaffUsers
                      {...props}
                      user={this.state.user}
                    />
                  }
                />
                <PrivateRoute
                  authed={isLoggedIn}
                  path="/users/students/"
                  Child = {(props) =>
                    <StudentUsers
                      {...props}
                      user={this.state.user}
                    />
                  }
                />
                <PrivateRoute
                  authed={isLoggedIn}
                  path="/tests/list/"
                  Child = {(props) =>
                    <TestList
                      {...props}
                      user={this.state.user}
                    />
                  }
                />
                <Route path={'/login/'} exact strict render={(props) => {
                    return !isLoggedIn ?
                      <LoginScreen {...props} getUser={this.getUser} /> :
                      <Redirect to={"/home/"} />
                    }
                  }
                />
                <Route path={'/forgot-password/'} exact strict render={(props) => (
                      <ForgotPassword {...props} />
                    )
                  }
                />
                <Route path={'/reset-password/:uid/:token/'} exact strict render={(props) => (
                      <ResetPassword {...props} />
                    )
                  }
                />
                <Route path={'/users/add/'} exact strict render={(props) => {
                      return <UserTabs {...props} />
                    }
                  }
                />
                <Route path={'/centres/'} exact strict render={(props) => {
                      return <Centres {...props} />
                    }
                  }
                />
                <Route path={'/centres/add/'} exact strict render={(props) => {
                      return <AddCentres {...props} />
                    }
                  }
                />
                <Route path={'/centres/edit/'} exact strict render={(props) => {
                      return <EditCentre {...props} />
                    }
                  }
                />
                <Route path={'/courses/'} exact strict render={(props) => {
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
