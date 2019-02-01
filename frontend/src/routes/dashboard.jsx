import Dashboard from "../views/Dashboard/Dashboard";
import UserProfile from "../views/UserProfile/UserProfile";
import TableList from "../views/TableList/TableList";
import Typography from "../views/Typography/Typography";
import Icons from "../views/Icons/Icons";
import Maps from "../views/Maps/Maps";
import Notifications from "../views/Notifications/Notifications";
import Centres from "../views/Centres/Centres";
import Courses from "../views/Courses/Courses";
import Subjects from "../views/Subjects/Subjects";
import Categories from "../views/Categories/Categories";
import Units from "../views/Units/Units";
import BulkStudents from "../views/BulkStudents/BulkStudents";
import Students from "../layouts/Students/Students";

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
  {
    path: "/user",
    name: "User Profile",
    icon: "pe-7s-user",
    component: UserProfile
  },
  {
    path: "/table",
    name: "Table List",
    icon: "pe-7s-note2",
    component: TableList
  },
  {
    path: "/typography",
    name: "Typography",
    icon: "pe-7s-news-paper",
    component: Typography
  },
  { path: "/icons", name: "Icons", icon: "pe-7s-science", component: Icons },
  { path: "/maps", name: "Maps", icon: "pe-7s-map-marker", component: Maps },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "pe-7s-bell",
    component: Notifications
  },
  { redirect: true, path: "/", to: "/dashboard", name: "Dashboard" }
];

export default dashboardRoutes;
