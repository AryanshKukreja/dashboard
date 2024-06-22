import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import "./dashboard.css";
import { MapContainer, TileLayer } from "react-leaflet";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedPCIType, setSelectedPCIType] = useState("prediction");
  const users = ["user1", "user2", "user3", "user4", "user5", "user6"];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePCITypeChange = (event) => {
    setSelectedPCIType(event.target.value);
  };

  return (
    <div className="flex h-screen">
      <div
        id="docs-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-[60] w-1/4 bg-gray-700 pt-7 pb-10 overflow-y-auto transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 flex items-center justify-between text-xl font-semibold text-white">
          <span>Select User:</span>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600"
            onClick={toggleSidebar}
            aria-controls="docs-sidebar"
            aria-label="Close sidebar"
          >
            <span className="sr-only">Close Sidebar</span>X
          </button>
        </div>
        <nav className="p-6 w-full flex flex-col flex-wrap">
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
                  className="flex items-center gap-x-3.5 py-2 px-2.5 text-lg text-white rounded-lg"
                >
                  {user}
                </label>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div
        className={`flex-grow transition-all duration-300 ml-${
          isSidebarOpen ? "64" : "0"
        } pl-4`}
      >
        <div className="flex h-full items-start justify-center">
          <div className="text-left text-white mt-20">
            <div className="text-5xl font-bold">ROAD QUALITY DASHBOARD</div>
            <div className="mt-4">
              <span className="italic">Select PCI type:</span>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-red-600"
                    name="pci-type"
                    value="prediction"
                    checked={selectedPCIType === "prediction"}
                    onChange={handlePCITypeChange}
                  />
                  <span className="ml-2">Prediction based</span>
                </label>
              </div>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-gray-600"
                    name="pci-type"
                    value="velocity"
                    checked={selectedPCIType === "velocity"}
                    onChange={handlePCITypeChange}
                  />
                  <span className="ml-2">Velocity Based</span>
                </label>
              </div>
            </div>
            <div className="mt-16 border-t border-gray-500 w-full"></div>
          </div>
        </div>
        <div className="mt-4">
          <MapContainer center={[51.505, -0.09]} zoom={13} className="h-screen">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        </div>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-600 fixed top-4 left-4 z-[61]"
          onClick={toggleSidebar}
          aria-controls="docs-sidebar"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
