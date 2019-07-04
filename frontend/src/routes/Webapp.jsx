import React , { Suspense } from "react";

const HomeLayout = React.lazy(()=> import("../layouts/Home/Home"));
const ResultsLayout = React.lazy(()=> import("../layouts/Results/Results"));

const webappRoutes = [
  {
    path: "/results",
    name: "Results",
    icon: "certificate",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <ResultsLayout {...props} />
      </Suspense>
    )

  },
  {
    path: "/home",
    name: "Home",
    icon: "home",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <HomeLayout {...props} />
      </Suspense>
    )

  },
  { redirect: true, path: "/", to: "/home", name: "Webapp" }
];

export default webappRoutes;
