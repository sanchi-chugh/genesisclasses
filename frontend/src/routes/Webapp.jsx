import Home from "../views/Home/Home";

const webappRoutes = [
  {
    path: "/home",
    name: "Home",
    icon: "pe-7s-graph",
    component: Home
  },
  {
    path: "/test",
    name: "Home",
    icon: "pe-7s-graph",
    component: Home
  },
  { redirect: true, path: "/", to: "/home", name: "Home" }
];

export default webappRoutes;
