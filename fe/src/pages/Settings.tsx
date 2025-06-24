import React, { useState, useEffect } from "react";

const Settings: React.FC = () => {
  const [urls, setUrls] = useState<{ _id: string; url: string }[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [frequency, setFrequency] = useState<"immediate" | "daily" | "weekly">(
    "immediate"
  );
  const [runTime, setRunTime] = useState("02:00");
  const [statusMessage, setStatusMessage] = useState("");

  // Load spider_urls on page load
  useEffect(() => {
    fetchSpiderUrls();
  }, []);

  const fetchSpiderUrls = async () => {
    try {
      const response = await fetch("http://localhost:8000/spider_urls");
      const data = await response.json();
      if (Array.isArray(data)) {
        setUrls(data);
      }
    } catch (error) {
      console.error("Error fetching spider URLs:", error);
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return;

    try {
      const response = await fetch("http://localhost:8000/spider_urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ url: newUrl }),
      });

      const result = await response.json();
      console.log("URL added:", result);
      setNewUrl("");
      fetchSpiderUrls();
    } catch (error) {
      console.error("Error adding spider URL:", error);
    }
  };

  const handleDeleteUrl = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/spider_urls/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      console.log("URL deleted:", result);
      fetchSpiderUrls();
    } catch (error) {
      console.error("Error deleting spider URL:", error);
    }
  };

  const runSpider = async () => {
    const urlsArray = urls.map((u) => u.url);

    if (urlsArray.length === 0) {
      alert("Please add at least one URL.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/run_spider?keywords=${encodeURIComponent(
          keyword
        )}&urls=${encodeURIComponent(
          urlsArray.join(",")
        )}&frequency=${encodeURIComponent(
          frequency
        )}&run_time=${encodeURIComponent(runTime)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();
      console.log("Spider triggered:", result);
      setStatusMessage(
        `Spider run triggered.\nKeywords: "${keyword}"\nURLs: ${urlsArray.join(
          ", "
        )}\nFrequency: ${frequency}\nRun Time: ${runTime}`
      );
    } catch (error) {
      console.error("Error running spider:", error);
      setStatusMessage("Failed to trigger spider");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Spider Settings</h1>

      {/* Add URL */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Enter new URL"
          className="flex-grow py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
        />
        <button
          onClick={handleAddUrl}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Add URL
        </button>
      </div>

      {/* URLs Table */}
      <div>
        <h2 className="text-lg font-medium text-slate-700 mb-2">Current URLs</h2>
        {urls.length === 0 ? (
          <p className="text-slate-500">No URLs configured.</p>
        ) : (
          <table className="w-full text-sm text-slate-700 border border-slate-300 rounded">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">URL</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((item) => (
                <tr key={item._id} className="border-t border-slate-200">
                  <td className="p-2">{item.url}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDeleteUrl(item._id)}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Keyword Input */}
      <div>
        <label
          htmlFor="keyword"
          className="block text-sm font-medium text-slate-600 mb-1"
        >
          Keywords (optional, comma separated)
        </label>
        <input
          id="keyword"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Example: fintech,startups,AI"
          className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
        />
      </div>

      {/* Frequency Dropdown */}
      <div>
        <label
          htmlFor="frequency"
          className="block text-sm font-medium text-slate-600 mb-1"
        >
          How often to run
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as any)}
          className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
        >
          <option value="immediate">Run Now (Immediate)</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {/* Run Now Button */}
      <button
        onClick={runSpider}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
      >
        Run Now
      </button>

      {/* Status Message */}
      {statusMessage && (
        <div className="mt-4 text-slate-700 whitespace-pre-line">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default Settings;
