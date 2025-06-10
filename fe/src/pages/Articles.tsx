import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchArticles,
  fetchCompaniesByEmpresa,
  fetchMediaReportsByEmpresa,
} from "../services/api";

type RawArticle = {
  _id: string | { $oid: string };
  ID: number;
  URL: string;
  Título: string;
  "Descripción en una frase": string;
  Resumen: string;
  "Nombres de personas": string;
  Puesto: string;
  Empresa: string;
  "Instituciones nombradas": string;
  "Personas de instituciones": string;
  "Personas de instituciones_2": string;
  "Personas de instituciones_3": string;
  "Personas de instituciones_4": string;
  Categoría: string;
};

type Article = Omit<RawArticle, "_id"> & { _id: string };

const columns: { key: keyof Article; label: string }[] = [
  { key: "ID", label: "ID" },
  { key: "URL", label: "Fuente" },
  { key: "Título", label: "Título" },
  { key: "Descripción en una frase", label: "Descripción" },
  { key: "Resumen", label: "Resumen" },
  { key: "Nombres de personas", label: "Personas" },
  { key: "Puesto", label: "Puesto" },
  { key: "Empresa", label: "Empresa" },
  { key: "Instituciones nombradas", label: "Instituciones" },
  { key: "Personas de instituciones", label: "Pers. Inst. 1" },
  { key: "Personas de instituciones_2", label: "Pers. Inst. 2" },
  { key: "Personas de instituciones_3", label: "Pers. Inst. 3" },
  { key: "Personas de instituciones_4", label: "Pers. Inst. 4" },
  { key: "Categoría", label: "Categoría" },
];

const Articles: React.FC = () => {
  const navigate = useNavigate();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [messageRowId, setMessageRowId] = useState<string | null>(null);
  const [mediaReports, setMediaReports] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetchArticles()
      .then((data: RawArticle[]) => {
        const normalized: Article[] = data.map((article) => ({
          ...article,
          _id:
            typeof article._id === "object" &&
            article._id !== null &&
            "$oid" in article._id
              ? (article._id as { $oid: string }).$oid
              : (article._id as string),
        }));
        setArticles(normalized);
        setIsLoading(false);
      })
      .catch((err) => {
        setError("Error fetching articles");
        setIsLoading(false);
      });
  }, []);

  const handleRowClick = async (article: Article) => {
    const empresa = article.Empresa;
    console.log("Empresa from clicked article:", empresa);

    if (!empresa) {
      setMatchMessage("No company information in this row.");
      setMessageRowId(article._id);
      // Also clear previous results to avoid stale buttons
      setMediaReports([]);
      setCompanies([]);
      return;
    }

    try {
      const [fetchedMediaReports, fetchedCompanies] = await Promise.all([
        fetchMediaReportsByEmpresa(empresa),
        fetchCompaniesByEmpresa(empresa),
      ]);

      console.log("Media Reports returned:", fetchedMediaReports);
      console.log("Companies returned:", fetchedCompanies);

      // Update state so UI can use these arrays for button rendering
      setMediaReports(fetchedMediaReports);
      setCompanies(fetchedCompanies);

      if (fetchedMediaReports.length > 0 && fetchedCompanies.length > 0) {
        setMatchMessage(
          "Matching rows exist in both Companies and Media Reports collections."
        );
      } else if (fetchedMediaReports.length > 0) {
        setMatchMessage("Matching row exists in the Media Reports collection.");
      } else if (fetchedCompanies.length > 0) {
        setMatchMessage("Matching row exists in the Companies collection.");
      } else {
        setMatchMessage(
          "No matching row exists in Companies or Media Reports collections."
        );
      }
      setMessageRowId(article._id);
    } catch (error) {
      setMatchMessage("Error checking for company in other collections.");
      setMessageRowId(article._id);
      setMediaReports([]);
      setCompanies([]);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-slate-500">Tabla de artículos de noticias</p>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            Cargando artículos...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {articles.map((article) => (
                <React.Fragment key={article._id}>
                  <tr
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(article)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap"
                      >
                        {col.key === "URL" && article[col.key] ? (
                          <a
                            href={article[col.key] as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 underline hover:text-emerald-800"
                          >
                            Fuente
                          </a>
                        ) : article[col.key] && article[col.key] !== "–" ? (
                          article[col.key]
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  {/* Notification and navigation area with action buttons */}
                  {messageRowId === article._id && matchMessage && (
                    <tr>
                      <td colSpan={columns.length}>
                        <div className="my-2 p-3 bg-blue-50 text-blue-700 rounded flex items-center justify-between">
                          <span>
                            {matchMessage}
                            {/* Navigation buttons for matched collections */}
                            {mediaReports.length > 0 && (
                              <button
                                className="ml-3 px-3 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/mediareports", {
                                    state: {
                                      highlightId: mediaReports[0]._id,
                                    },
                                  });
                                  setMatchMessage(null);
                                  setMessageRowId(null);
                                }}
                              >
                                Go to Media Reports
                              </button>
                            )}
                            {companies.length > 0 && (
                              <button
                                className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/companies", {
                                    state: { highlightId: companies[0]._id },
                                  });
                                  setMatchMessage(null);
                                  setMessageRowId(null);
                                }}
                              >
                                Go to Companies
                              </button>
                            )}
                          </span>
                          <button
                            className="ml-4 text-blue-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMatchMessage(null);
                              setMessageRowId(null);
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Articles;
