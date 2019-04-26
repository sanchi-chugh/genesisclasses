import Dashboard from "../views/Dashboard/Dashboard";
import Centres from "../views/Centres/Centres";
import Courses from "../views/Courses/Courses";
import Subjects from "../views/Subjects/Subjects";
import Categories from "../views/Categories/Categories";
import Units from "../views/Units/Units";
import BulkStudents from "../views/BulkStudents/BulkStudents";
import Students from "../layouts/Students/Students";
import Tests from "../layouts/Tests/Tests";

const dashboardRoutes = [
  // {
  //   path: "/dashboard",
  //   name: "Dashboard",
  //   icon: "pe-7s-graph",
  //   component: Dashboard
  // },
  {
    path: "/bulkStudents",
    name: "Bulk Students",
    icon: "pe-7s-study",
    component: BulkStudents
  },
  {
    path: "/students",
    name: "Students",
    icon: "pe-7s-user",
    component: Students
  },
  {
    path: "/centre",
    name: "Centres",
    icon: "pe-7s-culture",
    component: Centres
  },
  {
    path: "/course",
    name: "Courses",
    icon: "pe-7s-study",
    component: Courses
  },
  {
    path: "/categories",
    name: "Categories",
    icon: "pe-7s-study",
    component: Categories
  },
  {
    path: "/subjects",
    name: "Subjects",
    icon: "pe-7s-study",
    component: Subjects
  },
  {
    path: "/units",
    name: "Units",
    icon: "pe-7s-study",
    component: Units
  },
  {
    path: "/tests",
    name: "Tests",
    icon: "pe-7s-culture",
    component: Tests
  },
  { redirect: true, path: "/", to: "/bulkStudents", name: "Dashboard" }
];

export default dashboardRoutes;
