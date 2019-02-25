import Tests from "../views/Tests/Tests";
import EditTest from "../components/Actions/Tests/EditTests";
import ViewTest from "../components/Actions/Tests/ViewTests";
import AddTest from "../components/Actions/Tests/AddTest";
import Sections from "../views/Sections/Sections";
import Questions from "../views/Questions/Questions";
import ViewPassage from "../components/Actions/Questions/ViewPassage";
import ViewQuestion from "../components/Actions/Questions/ViewQuestions";

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
    { 
        path: "/tests/sections/questions/passages/:id", name: "passages", component: ViewPassage //id = passageId
    },
    { 
        path: "/tests/sections/questions/detail/:id", name: "question", component: ViewQuestion //id = questionId
    },
];

export default testsRoutes;
