import Dashboard from "../layouts/Dashboard/Dashboard.jsx";
import Webapp from "../layouts/Webapp/Webapp.jsx";
import TakeTest from "../layouts/TakeTest/TakeTest.jsx"
import TestResults from "../layouts/TestResults/TestResults.jsx"

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
        path: "/app/test/result/:id", name: "TestResults", component: TestResults
    },
	{
    	path: "/app/test/start/:id", name: "TakeTest", component: TakeTest
    },
    { 
        path: "/", name: "Webapp", component: Webapp
    },
];

export default appRoutes;
