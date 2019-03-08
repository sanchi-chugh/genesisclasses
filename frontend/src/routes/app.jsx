import Dashboard from "../layouts/Dashboard/Dashboard.jsx";
import Webapp from "../layouts/Webapp/Webapp.jsx";

export var appRoutes = [
    { 
        path: "/", name: "Dashboard", component: Dashboard
    },
    { 
        path: "/dashboard", name: "Dashboard", component: Dashboard 
    },
];

export var studentRoutes = [
    { 
        path: "/", name: "Webapp", component: Webapp
    },
];

export default appRoutes;
