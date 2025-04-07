import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-blue-50 text-gray-900">
      <div className="container mx-auto py-10">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
