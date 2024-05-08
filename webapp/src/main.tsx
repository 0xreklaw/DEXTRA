import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// pages
import DextraImitationPage from "./pages/imitation.tsx";
import DextraManualPage from "./pages/manual.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/imitation",
    element: <DextraImitationPage />,
  },
  {
    path: "/manual",
    element: <DextraManualPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
