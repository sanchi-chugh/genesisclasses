import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import Home from './pages/Home';
import Nav from './components/Nav';
import NavDrawer from './components/NavDrawer';
import { loggedIn } from './auth';

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
    }
  }

  drawerToggle() {
    console.log("called");
    this.setState({ drawerOpen: !this.state.drawerOpen });
  }

  render() {
    const { classes } = this.props;
    const isLoggedIn = loggedIn();
    return (
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <div className={classes.root}>
            {
              isLoggedIn ? (
                <div>
                  <Nav handleDrawerToggle={() => this.drawerToggle()} />
                  <NavDrawer
                    drawerOpen={this.state.drawerOpen}
                    handleDrawerToggle={() => this.drawerToggle()}
                  />
                </div>
              ) : ''
            }
            <div className={isLoggedIn ? classes.content : classes.content2}>
              <Switch>
                <Route path={'/home/'} exact render={(props) => {
                    return isLoggedIn ?
                            <Home {...props} /> :
                            <Redirect to={"/login/"} />
                  }
                } />
              </Switch>
            </div>
          </div>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles, { withTheme: true })(App);
