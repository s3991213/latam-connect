import React, { useEffect, useState, useRef } from "react";
import { fetchCompanies } from "../services/api";
import type { Company as RawCompany } from "../types/index";
import { useLocation } from "react-router-dom";

// After normalization, _id will always be string
type Company = Omit<RawCompany, "_id"> & { _id: string };

const columns: { key: keyof Company; label: string }[] = [
  { key: "ID", label: "ID" },
  {
    key: "Empresa protagonista (Nombre)",
    label: "Empresa protagonista (Nombre)",
  },
  { key: "Titulo", label: "Título" },
  { key: "Descripción breve", label: "Descripción breve" },
  { key: "Resumen", label: "Resumen" },
  { key: "Founder 1", label: "Founder 1" },
  { key: "Founder 2", label: "Founder 2" },
  { key: "Founder 3", label: "Founder 3" },
  { key: "Other Founders", label: "Other Founders" },
  { key: "Categoría/Sector", label: "Categoría/Sector" },
  { key: "Player 1", label: "Player 1" },
  { key: "Player 2", label: "Player 2" },
  { key: "Player 3", label: "Player 3" },
  { key: "Other Player", label: "Other Player" },
  { key: "Ubicación", label: "Ubicación" },
  { key: "Año de fundación", label: "Año de fundación" },
  { key: "Fecha de publicación", label: "Fecha de publicación" },
  { key: "Crecimiento reciente", label: "Crecimiento reciente" },
  { key: "Servicio principal", label: "Servicio principal" },
  { key: "Clientes principales", label: "Clientes principales" },
  { key: "Enfoque de inversión", label: "Enfoque de inversión" },
  { key: "Experiencia de fundadores", label: "Experiencia de fundadores" },
  { key: "Etapa de desarrollo", label: "Etapa de desarrollo" },
  { key: "Noticia propia o resumen?", label: "Noticia propia o resumen?" },
  { key: "URL de la fuente original", label: "URL de la fuente original" },
  { key: "Alianzas y colaboraciones", label: "Alianzas y colaboraciones" },
  {
    key: "Instrumentos financieros mencionados",
    label: "Instrumentos financieros mencionados",
  },
  {
    key: "Infraestructura de innovación",
    label: "Infraestructura de innovación",
  },
  { key: "Proyectos destacados", label: "Proyectos destacados" },
  { key: "Metas futuras", label: "Metas futuras" },
  { key: "Impacto esperado", label: "Impacto esperado" },
  { key: "Declaraciones destacadas", label: "Declaraciones destacadas" },
  { key: "Comentarios (del analista)", label: "Comentarios (del analista)" },
];

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const highlightId = location.state?.highlightId;
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  useEffect(() => {
    fetchCompanies()
      .then((data: RawCompany[]) => {
        // Normalize _id to always be a string
        const normalized: Company[] = data.map((company) => ({
          ...company,
          _id:
            typeof company._id === "object" &&
            company._id !== null &&
            "$oid" in company._id
              ? (company._id as { $oid: string }).$oid
              : (company._id as string),
        }));
        setCompanies(normalized);
        setIsLoading(false);
      })
      .catch((err) => {
        setError("Error fetching companies");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (highlightId && rowRefs.current[highlightId]) {
      rowRefs.current[highlightId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightId, companies]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-slate-500">Tabla de empresas</p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            Cargando empresas...
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
              {companies.map((company) => (
                <tr
                  key={company._id}
                  ref={(el) => {
                    if (company._id === highlightId)
                      rowRefs.current[company._id] = el;
                  }}
                  className={
                    "hover:bg-slate-50 transition-colors" +
                    (company._id === highlightId
                      ? " bg-emerald-400 "
                      : "")
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap"
                    >
                      {col.key === "URL de la fuente original" &&
                      company[col.key] ? (
                        <a
                          href={company[col.key] as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 underline hover:text-emerald-800"
                        >
                          Fuente
                        </a>
                      ) : company[col.key] && company[col.key] !== "–" ? (
                        company[col.key]
                      ) : (
                        <span className="text-slate-300">—</span>
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

export default Companies;
