import Tests from "../views/Tests/Tests";
import EditTest from "../components/Actions/Tests/EditTests";
import ViewTest from "../components/Actions/Tests/ViewTests";
import AddTest from "../components/Actions/Tests/AddTest";
import Sections from "../views/Sections/Sections";
import Questions from "../views/Questions/Questions";

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
        path: "/tests/sections/:id", name: "sections", component: Sections //id = testID
    },
    { 
        path: "/tests/sections/questions/:id", name: "questions", component: Questions //id = sectionId
    },
];

export default testsRoutes;
