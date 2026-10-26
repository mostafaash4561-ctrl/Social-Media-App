import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useNetworkState } from "react-use";
import AuthProtectedRoute from "./Components/AuthProtectedRoute/AuthProtectedRoute";
import Layout from "./Components/Layout/Layout";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import AuthContextProvider from "./Context/AuthContext/AuthContext";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import NotFound from "./Pages/NotFound/NotFound";
import Notifications from "./Pages/Notifications/Notifications";
import PostDetails from "./Pages/PostDetails/PostDetails";
import Profile from "./Pages/Profile/Profile";
import Register from "./Pages/Register/Register";
import Settings from "./Pages/Settings/Settings";
import Suggestions from "./Pages/Suggestions/Suggestions";
import UserProfile from "./Pages/UserProfile/UserProfile";
import Offline from "./Components/Offline/Offline";

const query = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

const routing = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "users/:id",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "suggestions",
        element: (
          <ProtectedRoute>
            <Suggestions />
          </ProtectedRoute>
        ),
      },
      {
        path: "postdetails/:id",
        element: (
          <ProtectedRoute>
            <PostDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: (
          <AuthProtectedRoute>
            <Login />
          </AuthProtectedRoute>
        ),
      },
      {
        path: "register",
        element: (
          <AuthProtectedRoute>
            <Register />
          </AuthProtectedRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  const { online } = useNetworkState();

  return (
    <>
      {!online && <Offline />}
      <QueryClientProvider client={query}>
        <AuthContextProvider>
          <RouterProvider router={routing}></RouterProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
