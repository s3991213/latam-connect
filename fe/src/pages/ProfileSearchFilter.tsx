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

const sentiment_labels = ["Positive", "Negative", "Neutral"];

const categoryOptions = category_labels.map((label) => ({
  value: label,
  label,
}));
const locationOptions = location_labels.map((label) => ({
  value: label,
  label,
}));
const sentimentOptions = sentiment_labels.map((label) => ({
  value: label,
  label,
}));

type OptionType = { value: string; label: string };

const API_BASE_URL = "http://localhost:8000";

const ProfileSearchFilter: React.FC = () => {
  const [categories, setCategories] = useState<OptionType[]>([]);
  const [countries, setCountries] = useState<OptionType[]>([]);
  const [sentiments, setSentiments] = useState<OptionType[]>([]);
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

  const handleSentimentChange = (
    newValue: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    setSentiments(Array.isArray(newValue) ? [...newValue] : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    categories.forEach((cat) => params.append("category", cat.value));
    countries.forEach((loc) => params.append("country", loc.value));
    sentiments.forEach((sent) => params.append("sentiment", sent.value));

    try {
      const res = await fetch(
        `${API_BASE_URL}/enriched_articles/?${params.toString()}`
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
        <div>
          <label className="block text-sm font-semibold text-emerald-700 mb-1">
            Sentiment
          </label>
          <Select
            options={sentimentOptions}
            value={sentiments}
            onChange={handleSentimentChange}
            isMulti
            isClearable
            placeholder="Select sentiment..."
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
                    {item.title || "—"}
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

      {/* Modal Popup - Only render when modal is open and selectedItem exists */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-emerald-800">
                {selectedItem.title || "No title"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Content</p>
                {selectedItem.insights ? (
                  <ul className="mt-1 text-gray-800 space-y-1">
                    {selectedItem.insights
                      .split("•")
                      .filter((point: string) => point.trim())
                      .map((point: string, index: React.Key | null | undefined) => (
                        <li key={index} className="flex">
                          <span className="mr-2">•</span>
                          <span>{point.trim()}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-gray-800 mt-1">No content available</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Category
                  </p>
                  <p className="text-gray-800 mt-1">
                    {selectedItem.category || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Country</p>
                  <p className="text-gray-800 mt-1">
                    {selectedItem.country || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Sentiment
                  </p>
                  <p className="text-gray-800 mt-1">
                    {selectedItem.sentiment || "—"}
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-purple-700 mb-2">
                  Relevance Score
                </p>
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= parseInt(selectedItem.relevance_score || "0")
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300 fill-current"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedItem.relevance_score || "Not rated"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSearchFilter;
