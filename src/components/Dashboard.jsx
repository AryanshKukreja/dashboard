import React, { useState } from "react";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const users = ["user1", "user2", "user3", "user4", "user5", "user6"];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <button
        type="button"
        className="text-gray-500 hover:text-gray-600 z-50"
        onClick={toggleSidebar}
        aria-controls="docs-sidebar"
        aria-label="Toggle navigation"
      >
        <span className="sr-only">Toggle Navigation</span>
        {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      </button>

      <div
        id="docs-sidebar"
        className={`hs-overlay [--auto-close:lg] hs-overlay-open:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 transform fixed top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 pt-7 pb-10 overflow-y-auto lg:translate-x-0 lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300`}
      >
        <div className="px-6 flex-none text-xl font-semibold">Select User:</div>
        <nav
          className="hs-accordion-group p-6 w-full flex flex-col flex-wrap"
          data-hs-accordion-always-open
        >
          <ul className="space-y-1.5">
            {users.map((user, index) => (
              <li key={index} className="flex">
                <input
                  type="checkbox"
                  className="shrink-0 mt-1 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  id={`user-checkbox-${index}`}
                />
                <label
                  htmlFor={`user-checkbox-${index}`}
                  className="flex items-center gap-x-3.5 py-2 px-2.5 text-lg text-gray-700 rounded-lg"
                >
                  {user}
                </label>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Dashboard;
