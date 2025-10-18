import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import Customers from "@/components/Customers";
import Invoices from "@/components/Invoices";
import Payments from "@/components/Payments";
import Checks from "@/components/Checks";
import WeeklySchedule from "@/components/WeeklySchedule";
import Users from "@/components/Users";
import ImportExport from "@/components/ImportExport";
import Layout from "@/components/Layout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/customers"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Customers />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/invoices"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Invoices />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/payments"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Payments />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/checks"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Checks />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/weekly-schedule"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <WeeklySchedule />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/users"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Users />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/settings"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout}>
                  <Settings />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
