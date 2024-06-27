import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, Tooltip } from "react-leaflet";

const colorDict = {
  1: "green",
  2: "blue",
  3: "yellow",
  4: "orange",
  5: "red",
};

const legendData = [
  { pci: 1.0, color: colorDict[1.0], label: "PCI 1.0" },
  { pci: 2.0, color: colorDict[2.0], label: "PCI 2.0" },
  { pci: 3.0, color: colorDict[3.0], label: "PCI 3.0" },
  { pci: 4.0, color: colorDict[4.0], label: "PCI 4.0" },
  { pci: 5.0, color: colorDict[5.0], label: "PCI 5.0" },
];

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pciType, setPciType] = useState("Prediction based");
  const [mapData, setMapData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://13.201.2.105/get_data_dump");
      setMapData(response.data);
      const userNames = new Set(response.data.map((entry) => entry[0]));
      setUsers([...userNames]);
      setSelectedUsers(
        [...userNames].reduce((acc, user) => ({ ...acc, [user]: true }), {})
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getColorAndPci = (pciType, pciScore, velocity) => {
    if (pciType === "Prediction based") {
      return [colorDict[pciScore], pciScore];
    } else if (pciType === "Velocity Based") {
      if (0 <= velocity && velocity < 2.78) {
        return [colorDict[5.0], 5.0];
      } else if (2.78 <= velocity && velocity < 5.56) {
        return [colorDict[4.0], 4.0];
      } else if (5.56 <= velocity && velocity < 8.34) {
        return [colorDict[3.0], 3.0];
      } else if (8.34 <= velocity && velocity < 10) {
        return [colorDict[2.0], 2.0];
      } else if (velocity >= 10) {
        return [colorDict[1.0], 1.0];
      }
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers({
      ...selectedUsers,
      [user]: !selectedUsers[user],
    });
  };

  const toggleDropdown = (user) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [user]: !prev[user],
    }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePciTypeChange = (event) => {
    setPciType(event.target.value);
  };

  const getUserStats = (userData) => {
    const statDict = {
      1: { number_of_segments: 0, distance_travelled: 0, avg_velocity: 0 },
      2: { number_of_segments: 0, distance_travelled: 0, avg_velocity: 0 },
      3: { number_of_segments: 0, distance_travelled: 0, avg_velocity: 0 },
      4: { number_of_segments: 0, distance_travelled: 0, avg_velocity: 0 },
      5: { number_of_segments: 0, distance_travelled: 0, avg_velocity: 0 },
    };

    userData.forEach((entry) => {
      const pci = entry[1];
      const distance = entry[4] / 1000;
      const velocity = entry[2];

      statDict[pci].number_of_segments += 1;
      statDict[pci].distance_travelled += distance;
      statDict[pci].avg_velocity =
        (statDict[pci].avg_velocity * statDict[pci].number_of_segments +
          velocity) /
        (statDict[pci].number_of_segments + 1);
    });

    return statDict;
  };
  const renderUserStats = () => {
    return users
      .filter((user) => selectedUsers[user])
      .map((user) => {
        const userData = mapData.filter((entry) => entry[0] === user);
        const stats = getUserStats(userData);
        const userTracks = mapData.filter((entry) => entry[0] === user);

        return (
          <div key={user}>
            <div className="mt-10 mb-10 border-t border-gray-500 w-full" />
            <p className="mb-5 text-xl">{user}</p>
            <div className="relative inline-flex mt-4 mb-4">
              <button
                id={`hs-dropdown-${user}`}
                type="button"
                className="hs-dropdown-toggle py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                onClick={() => toggleDropdown(user)}
              >
                Tracks
                <svg
                  className={`size-4 transition-transform ${
                    dropdownOpen[user] ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div
                className={`absolute left-0 w-full mt-2 bg-white shadow-md rounded-lg p-2 transition-opacity duration-200 ${
                  dropdownOpen[user] ? "opacity-100" : "opacity-0 hidden"
                }`}
                style={{ maxHeight: "200px", overflowY: "auto" }}
                aria-labelledby={`hs-dropdown-${user}`}
              >
                {userTracks.map((track, index) => (
                  <a
                    key={index}
                    className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    href="#"
                    onClick={() => viewTrackOnMap(track, user)}
                  >
                    Track {index + 1}
                  </a>
                ))}
              </div>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-[8px] border border-white border-solid">
                    PCI
                  </th>
                  <th className="text-left p-[8px] border border-white border-solid">
                    Number of Segments
                  </th>
                  <th className="text-left p-[8px] border border-white border-solid">
                    Distance Travelled (Km)
                  </th>
                  <th className="text-left p-[8px] border border-white border-solid">
                    Avg Speed (Km/hr)
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats).map(([pci, data]) => (
                  <tr key={pci}>
                    <td className="text-left p-[8px] border border-white border-solid">
                      {pci}
                    </td>
                    <td className="text-left p-[8px] border border-white border-solid">
                      {data.number_of_segments}
                    </td>
                    <td className="text-left p-[8px] border border-white border-solid">
                      {data.distance_travelled.toFixed(2)}
                    </td>
                    <td className="text-left p-[8px] border border-white border-solid">
                      {data.avg_velocity.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      });
  };

  const Legend = () => (
    <div className="absolute w-32 bottom-5 right-5 bg-black p-5 rounded-lg shadow-md z-[1000]">
      <h3 className="text-lg font-semibold mb-2">Legend</h3>
      {legendData.map((item) => (
        <div key={item.pci} className="flex items-center gap-2 gap-y-5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );

  const mapRef = useRef();

  const viewTrackOnMap = (track, user) => {
    const coordinates = track[3];
    if (coordinates.length > 0) {
      const bounds = coordinates.map((coord) => [coord[0], coord[1]]);
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds);
      }
    }
    // Close the dropdown
    setDropdownOpen((prev) => ({
      ...prev,
      [user]: false,
    }));
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
                  className="shrink-0 mt-1 border-gray-200 rounded text-red-600 focus:ring-red-500 disabled:opacity-50 disabled:pointer-events-none"
                  id={`user-checkbox-${index}`}
                  checked={selectedUsers[user]}
                  onChange={() => toggleUserSelection(user)}
                />
                <label
                  htmlFor={`user-checkbox-${index}`}
                  className="flex items-center gap-x-3.5 py-2 px-2.5 text-lg text-white rounded-lg cursor-pointer"
                >
                  {user}
                </label>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div
        className={`flex-grow transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        } pl-4`}
      >
        <div className="flex flex-col items-center justify-start h-full mt-20 text-white">
          <div className="text-left w-full max-w-3xl">
            <div className="text-5xl font-bold">ROAD QUALITY DASHBOARD</div>
            <div className="mt-4">
              <span className="italic">Select PCI type:</span>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-red-600"
                    name="pciType"
                    value="Prediction based"
                    checked={pciType === "Prediction based"}
                    onChange={handlePciTypeChange}
                  />
                  <span className="ml-2">Prediction based</span>
                </label>
              </div>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-red-600"
                    name="pciType"
                    value="Velocity Based"
                    checked={pciType === "Velocity Based"}
                    onChange={handlePciTypeChange}
                  />
                  <span className="ml-2">Velocity Based</span>
                </label>
              </div>
            </div>
            <div className="mt-8">
              <MapContainer
                center={[16.8557, 73.5453]}
                zoom={12}
                style={{ width: "100%", height: "600px" }}
                ref={mapRef}
              >
                <Legend />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapData.map((entry, index) => {
                  const user = entry[0];
                  const pciScore = entry[1];
                  const velocity = entry[2];
                  const polyline = entry[3];
                  const distance = entry[4];

                  if (!selectedUsers[user]) return null;

                  const [color, displayPci] = getColorAndPci(
                    pciType,
                    pciScore,
                    velocity
                  );

                  return (
                    <Polyline
                      key={index}
                      positions={polyline}
                      color={color}
                      pathOptions={{ user }}
                      weight={5}
                      eventHandlers={{
                        click: () => viewTrackOnMap(user),
                      }}
                    >
                      <Tooltip>
                        <div>
                          <p>User: {user}</p>
                          <p>PCI Score: {displayPci}</p>
                          <p>Average Velocity: {velocity.toFixed(2)} Km/h</p>
                          <p>Polyline Length: {distance.toFixed(2)} Km</p>
                        </div>
                      </Tooltip>
                    </Polyline>
                  );
                })}
              </MapContainer>
            </div>
            <div className="mt-8">
              <div className="text-3xl font-bold mb-4">User Statistics</div>
              <div className="flex flex-col space-y-4">{renderUserStats()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
