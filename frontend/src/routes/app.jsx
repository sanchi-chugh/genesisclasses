import React, {Suspense} from 'react';

const Dashboard = React.lazy(() => import('../layouts/Dashboard/Dashboard'));
const Webapp = React.lazy(() => import('../layouts/Webapp/Webapp'));
const TakeTest = React.lazy(() => import('../layouts/TakeTest/TakeTest.jsx'));
const TestResults = React.lazy(() => import('../layouts/TestResults/TestResults.jsx'));

export var appRoutes = [
    { 
        path: "/", name: "Dashboard",
        component: (props) => (
            <Suspense fallback={<div className="loader"></div>}>
                <Dashboard {...props} />
            </Suspense>
        )
    },
];

export var studentRoutes = [
    {
        path: "/app/test/result/:id", name: "TestResults",
        component: (props) => (
            <Suspense fallback={<div className="loader"></div>}>
                <TestResults {...props} />
            </Suspense>
        )
    },
	{
    	path: "/app/test/start/:id", name: "TakeTest",
        component: (props) => (
            <Suspense fallback={<div className="loader"></div>}>
                <TakeTest {...props} />
            </Suspense>
        )
    },
    { 
        path: "/", name: "Webapp",
        component: (props) => (
            <Suspense fallback={<div className="loader"></div>}>
                <Webapp {...props} />
            </Suspense>
        )
    },
];

export default appRoutes;
