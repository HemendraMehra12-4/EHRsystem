import React from "react";

export function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-semibold"
    >
      {children}
    </button>
  );
}
