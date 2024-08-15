import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

//Store import 

import { SocketProvider } from "./store/socket";

//Store import 

//Pages import

import Lobby from "./pages/Lobby";
import Room from "./pages/Room";

//Pages import

const router = createBrowserRouter([
  {
    path: "/",
    element: <Lobby />,
  },
  {
    path: "/room/:roomId",
    element: <Room />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </React.StrictMode>
);
