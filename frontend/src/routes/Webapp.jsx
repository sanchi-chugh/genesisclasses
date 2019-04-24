import HomeLayout from "../layouts/Home/Home";
import ResultsLayout from "../layouts/Results/Results";

const webappRoutes = [
  {
    path: "/results",
    name: "Results",
    icon: "certificate",
    component: ResultsLayout
  },
  {
    path: "/home",
    name: "Home",
    icon: "home",
    component: HomeLayout
  },
  { redirect: true, path: "/", to: "/home", name: "Webapp" }
];

export default webappRoutes;
