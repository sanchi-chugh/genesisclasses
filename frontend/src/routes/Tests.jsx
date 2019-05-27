import Tests from "../views/Tests/Tests";
import EditTest from "../components/Actions/Tests/EditTests";
import ViewTest from "../components/Actions/Tests/ViewTests";
import AddTest from "../components/Actions/Tests/AddTest";
import TestResults from "../components/Actions/Tests/TestResults";
import Sections from "../views/Sections/Sections";
import Questions from "../views/Questions/Questions";
import ViewPassage from "../components/Actions/Questions/ViewPassage";
import ViewQuestion from "../components/Actions/Questions/ViewQuestions";
import AddQuestion from "../components/Actions/Questions/AddQuestion";
import EditQuestions from "../components/Actions/Questions/EditQuestions";

var testsRoutes = [
    { 
        path: "/tests", name: "tests", component: Tests
    },
    { 
        path: "/tests/edit/:id", name: "edit", component: EditTest //testID
    },
    { 
        path: "/tests/results/:id", name: "results", component: TestResults
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
    { 
        path: "/tests/sections/questions/add/:id", name: "add question", component: AddQuestion //id = sectionId
    },
    { 
        path: "/tests/sections/questions/detail/edit/:id", name: "edit question", component: EditQuestions //id = questionId
    },
];

export default testsRoutes;
