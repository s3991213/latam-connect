import React, { useState, useEffect } from "react";
import Select from "react-select";

const API_BASE_URL = "http://localhost:8000";

const NewsSearchFilter: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [website, setWebsite] = useState("");
  const [websiteOptions, setWebsiteOptions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch website links on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/website_links/`)
      .then((res) => res.json())
      .then((data) => setWebsiteOptions(data))
      .catch(() => setWebsiteOptions([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append("keyword", keyword);
    if (website) params.append("website", website);
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);

    try {
      const res = await fetch(
        `${API_BASE_URL}/search_websites/?${params.toString()}`
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

  const websiteOptionsFormatted = websiteOptions.map((link) => ({
    value: link,
    label: link,
  }));

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Palabra clave
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2"
            placeholder="Ej: Fintech"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Enlace del sitio web
          </label>
          <Select
            options={websiteOptionsFormatted}
            value={
              websiteOptionsFormatted.find((opt) => opt.value === website) ||
              null
            }
            onChange={(selected) => setWebsite(selected ? selected.value : "")}
            isClearable
            placeholder="Selecciona o busca un enlace..."
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
          disabled={loading}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && <div className="text-rose-600 text-center">{error}</div>}

      <div className="overflow-x-auto mt-6">
        {results.length > 0 && (
          <table className="min-w-full divide-y divide-slate-200 bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                  Colección
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                  Título / Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                  URL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm text-slate-700">
                    {item.collection}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-700">
                    {item.Título ||
                      item.Title ||
                      item["Empresa protagonista (Nombre)"] ||
                      item.Titulo ||
                      "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-700">
                    {item.URL ? (
                      <a
                        href={item.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 underline hover:text-emerald-800"
                      >
                        Ver
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && results.length === 0 && (
          <div className="text-slate-500 text-center mt-8">
            No hay resultados.
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSearchFilter;
