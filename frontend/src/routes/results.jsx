import Results from "../views/Results/Results";

const resultsRoutes = [
  {
    path: "/results/",
    name: "Home",
    icon: "pe-7s-graph",
    component: Results
  },
  { redirect: true, path: "/", to: "/", name: "Home" }
];

export default resultsRoutes;
