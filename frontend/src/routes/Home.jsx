import Home from "../views/Home/Home";
import UnitWiseTests from "../views/UnitWiseTests/UnitWiseTest";
import CategoryWiseTests from "../views/CategoryWseTest/CategoryWiseTest";
import ChapterWise from "../views/ChapterWiseTests/ChapterWise";
import EditProfile from "../views/EditProfile/EditProfile";

const homeRoutes = [
  {
    path: "/home/",
    name: "Home",
    icon: "pe-7s-graph",
    component: Home
  },
  {
    path: "/home/subjects/",
    name: "Subjects",
    icon: "pe-7s-graph",
    component: UnitWiseTests
  },
  {
    path: "/home/subjects/:id", //subjectID
    name: "Units",
    icon: "pe-7s-graph",
    component: ChapterWise
  },
  {
    path: "/home/category/:id", //categoryPK
    name: "Category",
    icon: "pe-7s-graph",
    component: CategoryWiseTests
  },
  {
    path: "/home/editProfile",
    name: "Edit Profile",
    icon: "pe-7s-graph",
    component: EditProfile
  },
  { redirect: true, path: "/", to: "/home/", name: "Home" }
];

export default homeRoutes;
