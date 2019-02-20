import Tests from "../views/Tests/Tests";
import EditTest from "../components/Actions/Tests/EditTests";
import ViewTest from "../components/Actions/Tests/ViewTests";
import AddTest from "../components/Actions/Tests/AddTests";
import Sections from "../views/Sections/Sections";

var testsRoutes = [
    { 
        path: "/tests", name: "tests", component: Tests
    },
    { 
        path: "/tests/edit", name: "edit", component: EditTest
    },
    { 
        path: "/tests/view", name: "view", component: ViewTest
    },
    { 
        path: "/tests/add", name: "add", component: AddTest
    },
    { 
        path: "/tests/sections/:id", name: "sections", component: Sections
    },
];

export default testsRoutes;
