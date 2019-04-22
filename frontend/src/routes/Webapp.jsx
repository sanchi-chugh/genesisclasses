import HomeLayout from "../layouts/Home/Home";
import ResultsLayout from "../layouts/Results/Results";

const webappRoutes = [
  {
    path: "/",
    name: "Home",
    icon: "home",
    component: HomeLayout
  },
  { redirect: true, path: "/", to: "/", name: "Home" }
];

export default webappRoutes;
