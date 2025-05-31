import React, { useState } from "react";
import Select, { MultiValue, ActionMeta } from "react-select";

const category_labels = [
  "FinTech",
  "AI",
  "Education",
  "Healthcare",
  "Government",
  "Finance",
  "None",
];
const location_labels = [
  "Argentina",
  "Chile",
  "Spain",
  "Mexico",
  "Colombia",
  "None",
];

const categoryOptions = category_labels.map((label) => ({
  value: label,
  label,
}));
const locationOptions = location_labels.map((label) => ({
  value: label,
  label,
}));

type OptionType = { value: string; label: string };

const API_BASE_URL = "http://localhost:8000";

const ProfileSearchFilter: React.FC = () => {
  const [categories, setCategories] = useState<OptionType[]>([]);
  const [countries, setCountries] = useState<OptionType[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleCategoryChange = (
    newValue: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    setCategories(Array.isArray(newValue) ? [...newValue] : []);
  };

  const handleCountryChange = (
    newValue: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    setCountries(Array.isArray(newValue) ? [...newValue] : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    categories.forEach((cat) => params.append("category", cat.value));
    countries.forEach((loc) => params.append("country", loc.value));

    try {
      const res = await fetch(
        `${API_BASE_URL}/news_company_profiles/?${params.toString()}`
      );
      if (!res.ok) throw new Error("Error fetching search results");
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-emerald-50 rounded-2xl shadow-lg space-y-8 border border-emerald-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-emerald-700 mb-1">
            Categories
          </label>
          <Select
            options={categoryOptions}
            value={categories}
            onChange={handleCategoryChange}
            isMulti
            isClearable
            placeholder="Select category..."
            className="rounded-lg"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#6ee7b7",
                borderRadius: "0.5rem",
                boxShadow: "none",
              }),
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-emerald-700 mb-1">
            Countries
          </label>
          <Select
            options={locationOptions}
            value={countries}
            onChange={handleCountryChange}
            isMulti
            isClearable
            placeholder="Select country..."
            className="rounded-lg"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#6ee7b7",
                borderRadius: "0.5rem",
                boxShadow: "none",
              }),
            }}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-emerald-700 transition"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="text-rose-600 text-center rounded bg-rose-50 py-2 px-4">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading && (
          <div className="text-emerald-700 text-center">Loading...</div>
        )}
        {!loading && results.length > 0 && (
          <table className="min-w-full bg-emerald-100 rounded-xl overflow-hidden shadow border border-emerald-200">
            <tbody>
              {results.map((item, idx) => (
                <tr
                  key={item._id || idx}
                  className="hover:bg-emerald-200 transition cursor-pointer"
                  onClick={() => handleRowClick(item)}
                  style={{ borderRadius: "0.75rem" }}
                >
                  <td className="px-6 py-4 text-base text-emerald-900 rounded-xl">
                    {item.news_title || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && results.length === 0 && (
          <div className="text-emerald-700 text-center mt-8">
            No results found.
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {modalOpen && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900 bg-opacity-40"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-sm shadow-2xl max-w-lg w-full max-h-[calc(100vh-32px)] mx-auto p-4 md:p-8 relative border-4 border-emerald-200 overflow-y-auto pretty-scrollbar text-base"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo at top right */}
            {selectedItem.logo_url && (
              <img
                src={selectedItem.logo_url}
                alt="Logo"
                className="absolute top-4 right-4 h-14 w-auto rounded-xl border border-emerald-100 bg-white p-1"
                style={{ maxWidth: "72px", objectFit: "contain" }}
              />
            )}
            {/* 
            // Uncomment to enable the X button in the top left:
            <button
              className="absolute top-4 left-4 text-emerald-400 hover:text-emerald-700 text-3xl font-bold z-10"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            */}
            {/* Title with right padding if logo present */}
            <h2
              className={`text-2xl font-bold mb-6 text-emerald-800 ${
                selectedItem.logo_url ? "pr-[80px]" : ""
              }`}
            >
              {selectedItem.news_title || "Article Details"}
            </h2>
            <div className="space-y-4 text-sm text-emerald-900">
              {/* Two-column grid for Company Name & CEO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-md p-3 shadow-lg">
                  <span className="font-semibold">Company Name:</span>
                  <div>{selectedItem.company_name || "—"}</div>
                </div>
                <div className="bg-emerald-50 rounded-md p-3 shadow-lg">
                  <span className="font-semibold">CEO:</span>
                  <div>{selectedItem.ceo || "—"}</div>
                </div>
              </div>
              {/* Summary (single-column) */}
              <div className="bg-emerald-50 rounded-md p-3 shadow-lg">
                <span className="font-semibold">Summary:</span>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {(selectedItem.summary
                    ? selectedItem.summary
                        .split(/[\n•\-•\.]+/)
                        .map((s: string) => s.trim())
                        .filter(Boolean)
                    : []
                  ).map((point: string, idx: number) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
                {!selectedItem.summary && <div>—</div>}
              </div>
              {/* Two-column grid for Category & Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-md p-3 shadow-lg">
                  <span className="font-semibold">Category:</span>
                  <div>{selectedItem.category || "—"}</div>
                </div>
                <div className="bg-emerald-50 rounded-md p-3 shadow-lg">
                  <span className="font-semibold">Country:</span>
                  <div>{selectedItem.country || "—"}</div>
                </div>
              </div>
              {/* Sentiment Analysis Section with Bar Visualization */}
              <div className="bg-emerald-50 rounded-md p-3 shadow-lg">
                <span className="font-semibold">Sentiment Analysis:</span>
                {selectedItem.sent_analysis ? (
                  (() => {
                    let sentiment = null;
                    try {
                      sentiment = JSON.parse(
                        selectedItem.sent_analysis.replace(/'/g, '"')
                      );
                    } catch (e) {
                      return (
                        <div className="mt-2">{selectedItem.sent_analysis}</div>
                      );
                    }
                    return (
                      <div className="mt-2 flex flex-col gap-2">
                        {/* Label as colored badge */}
                        <span
                          className={
                            "inline-block px-2 py-0.5 rounded-full text-white text-xs font-bold w-fit " +
                            (sentiment.label?.toLowerCase().includes("positive")
                              ? "bg-emerald-500"
                              : sentiment.label
                                  ?.toLowerCase()
                                  .includes("negative")
                              ? "bg-rose-500"
                              : "bg-slate-400")
                          }
                        >
                          {sentiment.label
                            ? sentiment.label.charAt(0).toUpperCase() +
                              sentiment.label.slice(1)
                            : "—"}
                        </span>
                        {/* Bar visualization */}
                        <div className="w-full h-4 bg-emerald-100 rounded-full overflow-hidden relative">
                          <div
                            className={
                              "h-full rounded-full transition-all duration-500 " +
                              (sentiment.label
                                ?.toLowerCase()
                                .includes("positive")
                                ? "bg-emerald-400"
                                : sentiment.label
                                    ?.toLowerCase()
                                    .includes("negative")
                                ? "bg-rose-400"
                                : "bg-slate-400")
                            }
                            style={{
                              width: `${
                                Math.max(
                                  0,
                                  Math.min(5, Number(sentiment.score) || 0)
                                ) * 20
                              }%`,
                            }}
                          ></div>
                          {/* Numeric score overlay */}
                          <span className="absolute inset-0 flex items-center justify-center text-emerald-900 font-semibold text-xs">
                            {sentiment.score}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div>—</div>
                )}
              </div>
              {/* View Article link */}
              {(selectedItem.url || selectedItem.URL) && (
                <div className="bg-emerald-50 rounded-md p-3 shadow-lg">
                  <a
                    href={selectedItem.url || selectedItem.URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 underline hover:text-emerald-900 font-semibold"
                  >
                    View Article
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSearchFilter;
