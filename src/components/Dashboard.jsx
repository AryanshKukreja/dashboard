import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, Tooltip } from "react-leaflet";

const colorDict = {
  1: "red",
  2: "orange",
  3: "yellow",
  4: "blue",
  5: "green",
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
  const [pciType, setPciType] = useState("Prediction Based");
  const [mapData, setMapData] = useState([]);
  const [selectedRoads, setSelectedRoads] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("date");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("name");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("https://pcibackend.xyz/get_data_dump");
      setMapData(response.data);
      const userNames = new Set(response.data.map((entry) => entry.userName));
      setUsers([...userNames]);
      setSelectedUsers(
        [...userNames].reduce((acc, user) => ({ ...acc, [user]: true }), {})
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getColorAndPci = (pciType, pciScore, velocity) => {
    if (pciType === "Prediction Based") {
      return [colorDict[pciScore], pciScore];
    } else if (pciType === "Velocity Based") {
      if (0 <= velocity && velocity < 2.5) {
        return [colorDict[2.0], 2.0];
      } else if (velocity < 5) {
        return [colorDict[3.0], 3.0];
      } else if (velocity < 7.5) {
        return [colorDict[4.0], 4.0];
      } else if (velocity >= 7.5) {
        return [colorDict[5.0], 5.0];
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePciTypeChange = (event) => {
    setPciType(event.target.value);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const isSameKey = prev.key === key;
      const direction = isSameKey && prev.direction === "asc" ? "desc" : "asc";
      return { key, direction };
    });
  };
  const renderSelectedRoadStats = () => {
    const stats = computeSelectedRoadStats();

    if (stats.length === 0) {
      return <div className="text-white text-lg">No roads selected.</div>;
    }

    // Group stats by the combination of username and road_name
    const groupedStats = stats.reduce((acc, segment) => {
      const key = `${segment.username}-${segment.road_name}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(segment);
      return acc;
    }, {});

    // Calculate the summary data for PCI score-based grouping
    const pciGroupedStats = stats.reduce((acc, segment) => {
      console.log("Segment; ", acc);
      const { pci_score, avg_velocity, distance } = segment;

      if (!acc[pci_score]) {
        acc[pci_score] = { totalDistance: 0, totalVelocity: 0, count: 0 };
      }

      acc[pci_score].totalDistance += parseFloat(distance);
      acc[pci_score].totalVelocity += parseFloat(avg_velocity);
      acc[pci_score].count += 1;

      return acc;
    }, {});

    return (
      <div className="mt-4">
        {/* Individual tables for each user and road */}
        {Object.keys(groupedStats).map((key, idx) => {
          const [username, roadName] = key.split("-");
          return (
            <div key={idx} className="mb-8">
              {/* Heading */}
              <h1 className="text-xl font-bold mb-2 text-white">
                User: {username} | Road: {roadName}
              </h1>
              {/* Table */}
              <table className="w-full border-collapse bg-white shadow-md rounded-lg">
                <thead className="bg-gray-600 text-white">
                  <tr>
                    <th className="p-3 border border-gray-300 text-left">
                      PCI Score
                    </th>
                    <th className="p-3 border border-gray-300 text-left">
                      Average Velocity (Km/h)
                    </th>
                    <th className="p-3 border border-gray-300 text-left">
                      Distance (Km)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {groupedStats[key].map((segment, segIdx) => (
                    <tr key={segIdx}>
                      <td className="p-3 border border-gray-200">
                        {segment.pci_score}
                      </td>
                      <td className="p-3 border border-gray-200">
                        {((segment.avg_velocity * 5) / 18).toFixed(5)}
                      </td>
                      <td className="p-3 border border-gray-200">
                        {(segment.distance / 1000).toFixed(5)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Summary Table for PCI Score Grouping */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Summary Grouped by PCI Score
          </h2>
          <table className="w-full border-collapse bg-white shadow-md rounded-lg">
            <thead className="bg-gray-600 text-white">
              <tr>
                <th className="p-3 border border-gray-300 text-left">
                  PCI Score
                </th>
                <th className="p-3 border border-gray-300 text-left">
                  Average Velocity (Km/h)
                </th>
                <th className="p-3 border border-gray-300 text-left">
                  Total Distance (Km)
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {Object.keys(pciGroupedStats).map((pci_score, idx) => {
                const { totalDistance, totalVelocity, count } =
                  pciGroupedStats[pci_score];
                const avgVelocity = (totalVelocity / count).toFixed(2); // Calculate average velocity for this PCI score
                return (
                  <tr key={idx}>
                    <td className="p-3 border border-gray-200">{pci_score}</td>
                    <td className="p-3 border border-gray-200">
                      {((avgVelocity * 5) / 18).toFixed(5)}
                    </td>
                    <td className="p-3 border border-gray-200">
                      {(totalDistance / 1000).toFixed(5)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleRoadSelection = (roadKey) => {
    setSelectedRoads((prevSelectedRoads) =>
      prevSelectedRoads.includes(roadKey)
        ? prevSelectedRoads.filter((key) => key !== roadKey)
        : [...prevSelectedRoads, roadKey]
    );
  };
  const computeSelectedRoadStats = () => {
    const selectedData = mapData.filter((data) =>
      selectedRoads.some((road) => `${data.userName}-${data.roadName}` === road)
    );

    // Include username and road name in the returned stats
    const stats = selectedData.flatMap((data) =>
      data.segments.map((segment) => ({
        username: data.userName,
        road_name: data.roadName,
        pci_score: segment.pci_score,
        avg_velocity: segment.avg_velocity.toFixed(2),
        distance: segment.distance.toFixed(2),
      }))
    );

    return stats;
  };

  const sortedSegments = () => {
    const uniqueEntries = new Map();

    mapData
      .filter((data) => selectedUsers[data.userName]) // Only selected users
      .forEach((data) => {
        if (!uniqueEntries.has(`${data.userName}-${data.roadName}`)) {
          uniqueEntries.set(`${data.userName}-${data.roadName}`, {
            date: data.date || "N/A",
            roadName: data.roadName,
            userName: data.userName,
          });
        }
      });

    const allSegments = Array.from(uniqueEntries.values());

    // Apply sorting logic
    if (sortConfig.key) {
      const key = sortConfig.key;
      const order = sortConfig.direction === "asc" ? 1 : -1;

      allSegments.sort((a, b) => {
        if (key === "date") {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return order * (dateA - dateB);
        }
        if (a[key] < b[key]) return -1 * order;
        if (a[key] > b[key]) return 1 * order;
        return 0;
      });
    }

    // Apply search filter logic
    return allSegments.filter((item) => {
      const query = searchQuery.toLowerCase();
      if (searchFilter === "name") {
        return item.userName.toLowerCase().includes(query);
      }
      if (searchFilter === "roadName") {
        return item.roadName.toLowerCase().includes(query);
      }
      return false;
    });
  };

  const renderUserStats = () => {
    const allSegments = sortedSegments();

    return (
      <div>
        <div className="flex items-center mb-4">
          <select
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="mr-2 p-2 border border-gray-300 rounded text-gray-500"
          >
            <option value="name">Search by Name</option>
            <option value="roadName">Search by Road Name</option>
          </select>
          <input
            type="text"
            placeholder="Enter search query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-gray-500"
          />
        </div>
        <table className="w-full border-collapse bg-white shadow-md rounded-lg">
          <thead className="bg-gray-600 text-white">
            <tr>
              <th
                className="p-3 border border-gray-300 text-left cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date
              </th>
              <th
                className="p-3 border border-gray-300 text-left cursor-pointer"
                onClick={() => handleSort("roadName")}
              >
                Road Name
              </th>
              <th
                className="p-3 border border-gray-300 text-left cursor-pointer"
                onClick={() => handleSort("userName")}
              >
                Name
              </th>
              <th className="p-3 border border-gray-300 text-left">Select</th>
            </tr>
          </thead>
          <tbody>
            {sortedSegments().map((item, idx) => (
              <tr key={idx} className="text-gray-700">
                <td className="p-3 border border-gray-200">{item.date}</td>
                <td className="p-3 border border-gray-200">{item.roadName}</td>
                <td className="p-3 border border-gray-200">{item.userName}</td>
                <td className="p-3 border border-gray-200">
                  <input
                    type="checkbox"
                    name="roadSelection"
                    value={`${item.userName}-${item.roadName}`}
                    checked={selectedRoads.includes(
                      `${item.userName}-${item.roadName}`
                    )}
                    onChange={() =>
                      handleRoadSelection(`${item.userName}-${item.roadName}`)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
  const viewPolyline = (user) => {
    const filteredData = mapData.filter((entry) => entry.userName === user);

    return filteredData.flatMap((entry) =>
      entry.segments.map((segment, index) => {
        const [color, pci] = getColorAndPci(
          pciType,
          segment.pci_score,
          segment.avg_velocity
        );

        return (
          <Polyline
            key={`${user}-${entry.roadName}-${index}`}
            positions={segment.coordinates}
            pathOptions={{ color: color, weight: 5 }}
            eventHandlers={{
              click: () => viewTrackOnMap(user),
            }}
          >
            <Tooltip>
              <div>
                <p>User: {user}</p>
                <p>Road: {entry.roadName}</p>
                <p>PCI Score: {pci}</p>
                <p>Average Velocity: {segment.avg_velocity.toFixed(2)} Km/h</p>
                <p>Distance Travelled: {segment.distance.toFixed(2)} km</p>
                <p>Track Number: {index + 1}</p>
              </div>
            </Tooltip>
          </Polyline>
        );
      })
    );
  };

  return (
    <div className="flex h-screen">
      <button
        type="button"
        className="fixed top-4 left-4 text-white p-2 rounded"
        onClick={toggleSidebar}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-panel-left-open"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 3v18" />
          <path d="m14 9 3 3-3 3" />
        </svg>
      </button>
      <div
        id="docs-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-[60] w-1/4 bg-gray-700 pt-7 pb-10 overflow-y-auto transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 flex items-center justify-between text-xl font-semibold text-white">
          <span>Road Details</span>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600"
            onClick={toggleSidebar}
            aria-controls="docs-sidebar"
            aria-label="Close sidebar"
          >
            <span className="sr-only">Close Sidebar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-panel-left-close"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="m16 15-3-3 3-3" />
            </svg>
          </button>
        </div>
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
                    value="Prediction Based"
                    checked={pciType === "Prediction Based"}
                    onChange={handlePciTypeChange}
                  />
                  <span className="ml-2">Prediction Based</span>
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
                center={[17.42099148, 73.22085649]}
                zoom={12}
                style={{ width: "100%", height: "600px" }}
                ref={mapRef}
              >
                <Legend />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {users
                  .filter((user) => selectedUsers[user])
                  .map((user) => viewPolyline(user))}
              </MapContainer>
            </div>
            <div className="mt-8">
              <div className="text-3xl font-bold mb-4">User Statistics</div>

              <div className="flex flex-col space-y-4">{renderUserStats()}</div>
            </div>
            <div className="p-6">{renderSelectedRoadStats()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
