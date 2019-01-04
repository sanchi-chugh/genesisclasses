import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import axios from 'axios';
import appRoutes from './routes/app.jsx';

import './App.css';
import LoginScreen from './views/LoginScreen/LoginScreen';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      busy: true,
    }
    this.getUser = this.getUser.bind(this);
  }

  componentWillMount() {
    this.setState({ busy: true }, () => this.getUser());
  }

  getUser(callBack) {
    console.log('fetch user')
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
    .catch(() => {
        delete localStorage.token;
        this.setState({ busy: false });
      });
  }

  logout(callBack) {
    delete localStorage.token;
    this.setState({ user: null }, callBack);
  }

  render() {
    const { user } = this.state;
    const isLoggedIn = this.state.user !== null;

    if (this.state.user === null && this.state.busy) {
      return (
        <center><div className="loader"></div></center>
      );
    }
    if(!isLoggedIn){
        return(
            <BrowserRouter>
                <Switch>
                    <Route to={'/login/'} render={(props) => <LoginScreen {...props} getUser={this.getUser} /> } />
                </Switch>
            </BrowserRouter>
        );
    }
    return (
        <BrowserRouter>
            <Switch>
            {appRoutes.map((prop, key) => {
                return <Route path={prop.path} component={prop.component} key={key} />;
            })}
            </Switch>
        </BrowserRouter>
    );
  }
}

export default App;
