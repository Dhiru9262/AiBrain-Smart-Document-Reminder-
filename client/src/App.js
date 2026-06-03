import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Reminders from "./pages/Reminders";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <div className="container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reminders"
                element={
                  <ProtectedRoute>
                    <Reminders />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
