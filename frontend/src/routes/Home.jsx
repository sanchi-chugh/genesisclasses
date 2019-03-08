import Home from "../views/Home/Home";
import UnitWiseTests from "../views/UnitWiseTests/UnitWiseTest";
import CategoryWiseTests from "../views/CategoryWseTest/CategoryWiseTest";

const homeRoutes = [
  {
    path: "/",
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
  {
    path: "/category/:id", //categoryPK
    name: "Category",
    icon: "pe-7s-graph",
    component: CategoryWiseTests
  },
  { redirect: true, path: "/", to: "/home", name: "Home" }
];

export default homeRoutes;
