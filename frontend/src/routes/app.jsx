import Dashboard from "../layouts/Dashboard/Dashboard.jsx";

var appRoutes = [
    { 
        path: "/", name: "index", component: Dashboard
    },
    { 
        path: "/home/", name: "Home", component: Dashboard 
    },
];

export default appRoutes;
