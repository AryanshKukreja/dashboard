import { useEffect } from "react";
import {
  useLocation,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./App.css";
import Dashboard from "./components/Dashboard.jsx";

import "preline/preline";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
]);

function App() {
  // const location = useLocation();
  // useEffect(() => {
  //   window.HSStaticMethods.autoInit();
  // }, [location.pathname]);

  return <RouterProvider router={router} />;
}

export default App;
