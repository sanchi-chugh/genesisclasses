import TakeTest from "../views/TakeTest/TakeTest";
import Instructions from "../views/TakeTest/Instructions";

const takeTestRoutes = [
  {
    path: "/app/test/start/:id",
    name: "Take Test",
    component: TakeTest
  },
  {
    path: "/app/test/instructions/:id",
    name: "Instructions",
    component: Instructions
  },
  { redirect: true, path: "/", to: "/", name: "Home" }
];

export default takeTestRoutes;
