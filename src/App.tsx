import GamePage from "pages/Game";
import HomePage from "pages/Home";
import SplashPage from "pages/Splash";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  { index: true, element: <SplashPage /> },
  { path: "/home", element: <HomePage /> },
  { path: "/game", element: <GamePage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
