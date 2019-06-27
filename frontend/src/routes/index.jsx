import React, {Suspense} from 'react';

const App = React.lazy(() => import('../App'));
const LoginScreen = React.lazy(() => import("../views/LoginScreen/LoginScreen"));

var indexRoutes = [
    { 
        path: "/", name: "app", 
        component: (props) => (
        	<Suspense fallback={<div className="loader"></div>}>
        		<App {...props} />
        	</Suspense>
        )
    },
    { 
        path: "/login/", name: "login",
        component: (props) => (
        	<Suspense fallback={<div className="loader"></div>}>
        		<LoginScreen {...props} />
        	</Suspense>
        )
    },
];

export default indexRoutes;
