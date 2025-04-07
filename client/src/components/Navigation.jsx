import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">DApp</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/user-registration" className="hover:text-blue-400">User Registration</Link>
        <Link to="/permissions-management" className="hover:text-blue-400">Manage Permissions</Link>
        <Link to="/data-upload" className="hover:text-blue-400">Upload Data</Link>
        <Link to="/data-retrieval" className="hover:text-blue-400">Retrieve Data</Link>
      </div>
    </nav>
  );
}
