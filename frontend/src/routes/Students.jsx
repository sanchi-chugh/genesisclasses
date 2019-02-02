import Students from "../views/Students/Students";
import EditProfile from "../components/Actions/Students/EditProfile";
import ViewProfile from "../components/Actions/Students/ViewProfile";
import AddStudents from "../components/Actions/Students/AddStudents";

var studentsRoutes = [
    { 
        path: "/students", name: "students", component: Students
    },
    { 
        path: "/students/edit", name: "edit", component: EditProfile
    },
    { 
        path: "/students/info", name: "info", component: ViewProfile
    },
    { 
        path: "/students/add", name: "add", component: AddStudents
    },
];

export default studentsRoutes;
