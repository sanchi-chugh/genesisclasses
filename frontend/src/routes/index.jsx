import App from "../App";
import LoginScreen from "../views/LoginScreen/LoginScreen";

var indexRoutes = [
    { 
        path: "/", name: "app", component: App
    },
    { 
        path: "/login/", name: "login", component: LoginScreen
    },
];

export default indexRoutes;
