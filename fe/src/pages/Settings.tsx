import React, { useState } from "react";

const Settings: React.FC = () => {
  const [urlsText, setUrlsText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [frequency, setFrequency] = useState<"immediate" | "daily" | "weekly">(
    "immediate"
  );
  const [runTime, setRunTime] = useState("02:00");
  const [statusMessage, setStatusMessage] = useState("");

  const runSpider = async () => {
    const urlsArray = urlsText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    if (urlsArray.length === 0) {
      alert("Please enter at least one URL.");
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

      {/* URLs Input */}
      <div>
        <label
          htmlFor="urls"
          className="block text-sm font-medium text-slate-600 mb-1"
        >
          URLs (one per line)
        </label>
        <textarea
          id="urls"
          rows={5}
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          placeholder="Enter URLs, one per line"
          className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
        ></textarea>
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
