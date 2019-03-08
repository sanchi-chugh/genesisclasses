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
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Dashboard
  },
  {
    path: "/students",
    name: "Students",
    icon: "pe-7s-user",
    component: Students
  },
  {
    path: "/tests",
    name: "Tests",
    icon: "pe-7s-culture",
    component: Tests
  },
  {
    path: "/course",
    name: "Courses",
    icon: "pe-7s-study",
    component: Courses
  },
  {
    path: "/bulkStudents",
    name: "Bulk Students",
    icon: "pe-7s-study",
    component: BulkStudents
  },
  {
    path: "/units",
    name: "Units",
    icon: "pe-7s-study",
    component: Units
  },
  {
    path: "/subjects",
    name: "Subjects",
    icon: "pe-7s-study",
    component: Subjects
  },
  {
    path: "/categories",
    name: "Categories",
    icon: "pe-7s-study",
    component: Categories
  },
  {
    path: "/centre",
    name: "Centres",
    icon: "pe-7s-culture",
    component: Centres
  },
  { redirect: true, path: "/", to: "/dashboard", name: "Dashboard" }
];

export default dashboardRoutes;
