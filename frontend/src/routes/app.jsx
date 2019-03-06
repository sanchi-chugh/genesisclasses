import Dashboard from "../layouts/Dashboard/Dashboard.jsx";
import Webapp from "../layouts/Webapp/Webapp.jsx";

export var appRoutes = [
    { 
        path: "/", name: "Dashboard", component: Dashboard
    },
    { 
        path: "/home", name: "Dashboard", component: Dashboard 
    },
];

export var studentRoutes = [
    { 
        path: "/", name: "Webapp", component: Webapp
    },
    { 
        path: "/home", name: "Webapp", component: Webapp
    },
];

export default appRoutes;
