import Home from "../views/Home/Home";
import UnitWiseTests from "../views/UnitWiseTests/UnitWiseTest";

const webappRoutes = [
  {
    path: "/home",
    name: "Home",
    icon: "pe-7s-graph",
    component: Home
  },
  {
    path: "/subjects",
    name: "Subjects",
    icon: "pe-7s-graph",
    component: UnitWiseTests
  },
  { redirect: true, path: "/", to: "/home", name: "Home" }
];

export default webappRoutes;
