import React , { Suspense } from "react";

import BulkStudents from "../views/BulkStudents/BulkStudents";

const Dashboard = React.lazy(()=> import("../views/Dashboard/Dashboard"));
const Centres = React.lazy(()=> import("../views/Centres/Centres"));
const Courses = React.lazy(()=> import("../views/Courses/Courses"));
const Subjects = React.lazy(()=> import("../views/Subjects/Subjects"));
const Categories = React.lazy(()=> import("../views/Categories/Categories"));
const Units = React.lazy(()=> import("../views/Units/Units"));
const Students = React.lazy(()=> import("../layouts/Students/Students"));
const Tests = React.lazy(()=> import("../layouts/Tests/Tests"));

const dashboardRoutes = [
  {
    path: "/bulkStudents",
    name: "Bulk Students",
    icon: "pe-7s-study",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <BulkStudents {...props} />
      </Suspense>
    )
  },
  {
    path: "/students",
    name: "Students",
    icon: "pe-7s-user",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <Students {...props} />
      </Suspense>
    )
  },
  {
    path: "/centre",
    name: "Centres",
    icon: "pe-7s-culture",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <Centres {...props} />
      </Suspense>
    )
  },
  {
    path: "/course",
    name: "Courses",
    icon: "pe-7s-study",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <Courses {...props} />
      </Suspense>
    )
  },
  {
    path: "/categories",
    name: "Categories",
    icon: "pe-7s-study",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <Categories {...props} />
      </Suspense>
    )
  },
  {
    path: "/subjects",
    name: "Subjects",
    icon: "pe-7s-study",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <Subjects {...props} />
      </Suspense>
    )
  },
  {
    path: "/units",
    name: "Units",
    icon: "pe-7s-study",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <Units {...props} />
      </Suspense>
    )
  },
  {
    path: "/tests",
    name: "Tests",
    icon: "pe-7s-culture",
    component: (props)=>(
      <Suspense fallback={<div className="loader"></div>}>
        <Tests {...props} />
      </Suspense>
    )
  },
  { redirect: true, path: "/", to: "/bulkStudents", name: "Dashboard" }
];

export default dashboardRoutes;
