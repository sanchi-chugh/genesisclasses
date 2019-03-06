import Dashboard from "../views/Dashboard/Dashboard";

const webappRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Dashboard
  },
  {
    path: "/test",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Dashboard
  },
  { redirect: true, path: "/", to: "/dashboard", name: "Dashboard" }
];

export default webappRoutes;
