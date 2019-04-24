import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import axios from 'axios';
import appRoutes, { studentRoutes } from './routes/app.jsx';

import './App.css';
import LoginScreen from './views/LoginScreen/LoginScreen';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      busy: true,
      email: null,
      username: null
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
      let user = res.data.profile;
      user.email = res.data.email;
      user.username = res.data.username;
      this.setState({ user: user, busy: false},
                    () => {
                      if (callBack)
                        callBack(user)
                    });
    })
    .catch(() => {
        delete localStorage.token;
        this.setState({ busy: false });
      });
  }

  logout(callBack) {
    delete localStorage.token;
    this.setState({ user: null , isLoggedIn:false  }, callBack);
  }

  render() {
    const { user } = this.state;
    const isLoggedIn = user !== null;

    if (user === null && this.state.busy) {
      return (
        <center><div className="loader"></div></center>
      );
    }
    if(user === null && !this.state.busy){
      return(
        <BrowserRouter>
            <Switch>
              <Route path={'/'} render={(props) => <LoginScreen {...props} getUser={this.getUser} /> } />
            </Switch>
        </BrowserRouter>
      )
    }
    if(isLoggedIn){
      return (
        <BrowserRouter>
            <Switch>
            { user.type === 'superadmin' 
              ? 
                appRoutes.map((prop, key) => {
                  return <Route path={prop.path} render={(props) => <prop.component {...props} logout={this.logout.bind(this)} /> } key={key} />;
              }) 
              :
                studentRoutes.map((prop, key) => {
                  return <Route path={prop.path} render={(props) => <prop.component {...props} 
                    user={user} 
                    logout={this.logout.bind(this)} /> } key={key} />;
              })
            }
            </Switch>
        </BrowserRouter>
      );
    }
  }
}

export default App;
