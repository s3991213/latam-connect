import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchMediaReports } from '../services/api';
import type { MediaReport as RawMediaReport } from '../types';

// After normalization, _id is always a string
type MediaReport = Omit<RawMediaReport, "_id"> & { _id: string };

const columns: { key: keyof MediaReport; label: string }[] = [
  { key: "ID", label: "ID" },
  { key: "Source", label: "Source" },
  { key: "Pais Fuente", label: "País Fuente" },
  { key: "Fecha Publicación", label: "Fecha Publicación" },
  { key: "Tema Principal", label: "Tema Principal" },
  { key: "Monto/Impacto", label: "Monto/Impacto" },
  { key: "Alcance Medio", label: "Alcance Medio" },
  { key: "Sector", label: "Sector" },
  { key: "Relevancia Geográfica", label: "Relevancia Geográfica" },
  { key: "Score", label: "Score" },
  { key: "Title", label: "Título" },
  { key: "URL", label: "Fuente" },
];

const MediaReports: React.FC = () => {
  const [reports, setReports] = useState<MediaReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const highlightId = location.state?.highlightId;
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  useEffect(() => {
    fetchMediaReports()
      .then((data: RawMediaReport[]) => {
        // Normalize _id to always be a string
        const normalized: MediaReport[] = data.map(report => ({
          ...report,
          _id:
            typeof report._id === 'object' &&
            report._id !== null &&
            '$oid' in report._id
              ? (report._id as { $oid: string }).$oid
              : (report._id as string),
        }));
        setReports(normalized);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Error fetching media reports');
        setIsLoading(false);
      });
  }, []);

  // Scroll to the highlighted row after reports are loaded
  useEffect(() => {
    if (highlightId && rowRefs.current[highlightId]) {
      rowRefs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, reports]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-slate-500">Tabla de Media Coverage</p>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando media reports...</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map(col => (
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
              {reports.map(report => (
                <tr
                  key={report._id}
                  ref={el => {
                    if (report._id === highlightId) rowRefs.current[report._id] = el;
                  }}
                  className={
                    "hover:bg-slate-50 transition-colors" +
                    (report._id === highlightId
                      ? " bg-emerald-400 "
                      : "")
                  }
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                      {col.key === "URL" && report[col.key] ? (
                        <a
                          href={report[col.key] as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 underline hover:text-emerald-800"
                        >
                          Fuente
                        </a>
                      ) : (
                        report[col.key] && report[col.key] !== "–"
                          ? report[col.key]
                          : <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MediaReports;
