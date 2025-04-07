import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard";
import UserRegistration from "../src/pages/UserRegistration";
import PermissionsManagement from "../src/pages/PermissionsManagement";
import DataUpload from "../src/components/DataUpload";
import DataRetrieval from "../src/pages/RetrieveData";
import Home from "../src/pages/Home";
import Layout from "../src/components/Layout";



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-registration" element={<UserRegistration />} />
          <Route path="/permissions-management" element={<PermissionsManagement />} />
          <Route path="/data-upload" element={<DataUpload />} />
          <Route path="/data-retrieval" element={<DataRetrieval />} />
        </Route>
      </Routes>
    </Router>
  );
}
