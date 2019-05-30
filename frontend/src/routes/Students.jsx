import Students from "../views/Students/Students";
import EditProfile from "../components/Actions/Students/EditProfile";
import StudentResults from "../components/Actions/Students/StudentResults";
import SectionWiseResults from "../components/Actions/Students/SectionWiseResults";
import QuestionWiseResults from "../components/Actions/Students/QuestionWiseResults";
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
        path: "/students/results/:id", name: "edit", component: StudentResults //student id
    },
    { 
        path: "/students/results/:id/test/:test", name: "edit", component: SectionWiseResults //student id , //testid
    },
    { 
        path: "/students/results/:id/test/sections/:section", name: "edit", component: QuestionWiseResults //student id , //section id
    },
    { 
        path: "/students/info", name: "info", component: ViewProfile
    },
    { 
        path: "/students/add", name: "add", component: AddStudents
    },
];

export default studentsRoutes;
