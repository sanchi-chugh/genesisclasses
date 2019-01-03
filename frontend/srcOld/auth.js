import axios from 'axios';

export const login = (username, pass, cb) => {
    if (localStorage.token) {
        if (cb) cb(true)
        return
    }
    getToken(username, pass, (res) => {
        if (res.authenticated) {
            localStorage.token = res.token;
            if (cb) cb(true, res);
        } else {
            if (cb) cb(false, res);
        }
    })
};

export const logout = () => {
    delete localStorage.token
};

export const loggedIn = () => {
    return !!localStorage.token
};

export const getToken = (username, pass, cb) => {
    axios.post('/api-auth/login/', {
        "username": username,
        "password": pass
    }).then((res) => {
        cb({
            authenticated: true,
            token: res.data.key,
            profile: res.data.profile
        })
    }).catch((err) => {
        cb(err.response);
    });
};