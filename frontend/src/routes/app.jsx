import Dashboard from "../layouts/Dashboard/Dashboard.jsx";
import LoginScreen from "../views/LoginScreen/LoginScreen";

var appRoutes = [
    { 
        path: "/login/", name: "login", component: LoginScreen
    },
    { 
        path: "/", name: "index", component: Dashboard
    },
    { 
        path: "/home/", name: "Home", component: Dashboard 
    },
];

export default appRoutes;
