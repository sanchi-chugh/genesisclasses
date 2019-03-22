import HomeLayout from "../layouts/Home/Home";

const webappRoutes = [
  {
    path: "/",
    name: "Home",
    icon: "pe-7s-graph",
    component: HomeLayout
  },
  { redirect: true, path: "/", to: "/", name: "Home" }
];

export default webappRoutes;
