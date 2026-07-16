"use client";

import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import {
  UploadCloud,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  FileSpreadsheet,
  Table2,
} from "lucide-react";

const TEMPLATES = {
  full: {
    filename: "member_import_template.csv",
    headers: ["fullName", "phone", "email", "branch", "department", "status", "dateOfBirth", "preferredChannel"],
    sample: ["John Doe", "+2348012345678", "john@example.com", "Main Campus", "Choir", "Active", "1990-01-15", "email"],
    label: "Full Member Data",
    desc: "All member fields including department, branch, and contact preferences",
  },
  monthly: {
    filename: "new_members_template.csv",
    headers: ["fullName", "phone", "email", "joinedAt"],
    sample: ["Jane Smith", "+2348098765432", "jane@example.com", "2026-07-01"],
    label: "Monthly New Members",
    desc: "Quick import for new members — just name and contact info",
  },
};

const HEADER_ALIASES: Record<string, string> = {
  "full name": "fullName",
  fullname: "fullName",
  name: "fullName",
  "phone number": "phone",
  mobile: "phone",
  telephone: "phone",
  "date of birth": "dateOfBirth",
  dob: "dateOfBirth",
  birthday: "dateOfBirth",
  "preferred channel": "preferredChannel",
  channel: "preferredChannel",
  "joined date": "joinedAt",
  "join date": "joinedAt",
  joined: "joinedAt",
  department: "department",
  branch: "branch",
  status: "status",
  tags: "tags",
};

function normalizeHeader(h: string): string {
  const trimmed = h.trim();
  const lower = trimmed.toLowerCase();
  return HEADER_ALIASES[lower] || trimmed;
}

const REQUIRED_FIELDS = ["fullName"];
const VALID_STATUSES = ["Active", "Inactive"];
const VALID_CHANNELS = ["email", "sms", "whatsapp"];

function validateRow(row: Record<string, string>, index: number) {
  const errors: string[] = [];
  const rowNum = index + 2;

  for (const field of REQUIRED_FIELDS) {
    if (!row[field] || row[field].trim().length < 2) {
      errors.push(`Row ${rowNum}: "${field}" is required (min 2 chars)`);
    }
  }

  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push(`Row ${rowNum}: Invalid email "${row.email}"`);
  }

  if (row.phone && !/^[+\d\s\-()]{7,15}$/.test(row.phone)) {
    errors.push(`Row ${rowNum}: Invalid phone "${row.phone}"`);
  }

  if (row.status && !VALID_STATUSES.includes(row.status)) {
    errors.push(`Row ${rowNum}: Status must be Active or Inactive (got "${row.status}")`);
  }

  if (row.preferredChannel && !VALID_CHANNELS.includes(row.preferredChannel)) {
    errors.push(`Row ${rowNum}: Channel must be email, sms, or whatsapp`);
  }

  return errors;
}

interface ParsedRow {
  index: number;
  data: Record<string, string>;
  errors: string[];
  valid: boolean;
}

interface MemberBulkUploadProps {
  churchId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function MemberBulkUpload({ churchId, onSuccess, onClose }: MemberBulkUploadProps) {
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [templateType, setTemplateType] = useState<"full" | "monthly">("full");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = useCallback((type: "full" | "monthly") => {
    const t = TEMPLATES[type];
    const csvContent = [
      t.headers.join(","),
      t.sample.join(","),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = t.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const parseFile = useCallback(async (file: File) => {
    setError("");
    const ext = file.name.split(".").pop()?.toLowerCase();

    try {
      let parsed: Record<string, string>[] = [];

      if (ext === "csv") {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false });
        if (result.errors.length > 0 && result.data.length === 0) {
          setError("Failed to parse CSV. Check the file format.");
          return;
        }
        parsed = result.data as Record<string, string>[];
      } else if (ext === "xlsx" || ext === "xls") {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          setError("Excel file appears empty — no sheets found.");
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
        parsed = json;
      } else {
        setError("Unsupported format. Please upload a .csv, .xlsx, or .xls file.");
        return;
      }

      if (parsed.length === 0) {
        setError("The file contains no data rows.");
        return;
      }

      const normalized = parsed.map((raw) => {
        const row: Record<string, string> = {};
        for (const [key, val] of Object.entries(raw)) {
          const normalizedKey = normalizeHeader(key);
          if (normalizedKey !== key || key === "fullName") {
            row[normalizedKey] = String(val ?? "").trim();
          } else {
            row[key] = String(val ?? "").trim();
          }
        }
        return row;
      });

      const parsedRows: ParsedRow[] = normalized.map((data, i) => {
        const errors = validateRow(data, i);
        return { index: i, data, errors, valid: errors.length === 0 };
      });

      setRows(parsedRows);
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "Failed to parse file.");
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [parseFile],
  );

  const confirmImport = useCallback(async () => {
    const validRows = rows.filter((r) => r.valid);
    if (validRows.length === 0) return;

    setImporting(true);
    setImportProgress(0);

    try {
      const members = validRows.map((r) => ({
        fullName: r.data.fullName || "",
        phone: r.data.phone || "",
        email: r.data.email || "",
        branch: r.data.branch || "Main Campus",
        department: r.data.department || "None",
        status: (r.data.status as "Active" | "Inactive") || "Active",
        dateOfBirth: r.data.dateOfBirth || "",
        preferredChannel: r.data.preferredChannel as "email" | "sms" | "whatsapp" | undefined,
        joinedAt: r.data.joinedAt || new Date().toISOString().split("T")[0],
        tags: r.data.tags ? r.data.tags.split(";").map((t) => t.trim()) : [],
      }));

      const res = await fetch("/api/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchId, members }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Import failed");

      setResult({
        imported: data.imported,
        skipped: data.skipped,
        errors: data.errors?.map((e: any) => e.reason) || [],
      });
      setImportProgress(members.length);
      setStep("result");

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  }, [rows, churchId, onSuccess]);

  const validCount = rows.filter((r) => r.valid).length;
  const errorCount = rows.filter((r) => !r.valid).length;
  const columns = rows.length > 0 ? Object.keys(rows[0].data).filter((k) => k !== "errors") : [];

  if (step === "result" && result) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">Import Complete</h3>
        <div className="flex items-center justify-center gap-8 mb-6">
          <div>
            <p className="text-3xl font-black text-emerald-600">{result.imported}</p>
            <p className="text-sm text-slate-500">Imported</p>
          </div>
          {result.skipped > 0 && (
            <div>
              <p className="text-3xl font-black text-amber-500">{result.skipped}</p>
              <p className="text-sm text-slate-500">Skipped</p>
            </div>
          )}
        </div>
        {result.errors.length > 0 && (
          <div className="max-h-32 overflow-y-auto mb-6 text-left">
            <p className="text-sm font-semibold text-rose-600 mb-2">Errors:</p>
            {result.errors.map((e, i) => (
              <p key={i} className="text-xs text-rose-500 mb-1">{e}</p>
            ))}
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
            Done
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {step === "upload" && (
        <div>
          <div className="flex gap-3 mb-6">
            {(["full", "monthly"] as const).map((type) => {
              const t = TEMPLATES[type];
              const active = templateType === type;
              return (
                <button
                  key={type}
                  onClick={() => setTemplateType(type)}
                  className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
                    active
                      ? "border-[var(--brand-blue)] bg-[var(--brand-blue)]/5 ring-2 ring-[var(--brand-blue)]/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {type === "full" ? (
                      <Table2 className={`w-4.5 h-4.5 ${active ? "text-[var(--brand-blue)]" : "text-slate-400"}`} />
                    ) : (
                      <FileSpreadsheet className={`w-4.5 h-4.5 ${active ? "text-[var(--brand-blue)]" : "text-slate-400"}`} />
                    )}
                    <span className={`text-sm font-semibold ${active ? "text-[var(--brand-blue)]" : "text-slate-900"}`}>
                      {t.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-8 text-center mb-5">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white shadow-sm rounded-full">
                <UploadCloud className="w-8 h-8 text-[var(--brand-blue)]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload your file</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Select a <strong>.csv</strong>, <strong>.xlsx</strong>, or <strong>.xls</strong> file
              with your member data. Use the template above as a guide.
            </p>

            {error && (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 mb-5">
                <XCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <label className="relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white rounded-xl bg-[var(--brand-blue)] hover:bg-[#0955db] cursor-pointer transition-colors">
              <UploadCloud className="w-4.5 h-4.5 mr-2" />
              Select File
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>

          <button
            onClick={() => downloadTemplate(templateType)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--brand-blue)] hover:text-[#0955db] transition-colors mx-auto"
          >
            <Download className="w-4 h-4" />
            Download {TEMPLATES[templateType].label} Template (.csv)
          </button>
        </div>
      )}

      {step === "preview" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setStep("upload")}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                {validCount} valid
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1.5 text-rose-600">
                  <XCircle className="w-4 h-4" />
                  {errorCount} errors
                </span>
              )}
              <span className="text-slate-400">{rows.length} total rows</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 mb-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 w-10">#</th>
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 w-16">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr
                    key={row.index}
                    className={`transition-colors ${
                      row.valid ? "bg-white" : "bg-rose-50/50"
                    } hover:bg-slate-50`}
                  >
                    <td className="px-3 py-2.5 text-xs text-slate-400">{row.index + 2}</td>
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2.5 text-xs text-slate-700 max-w-[160px] truncate">
                        {row.data[col] || <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      {row.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="relative group cursor-help">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <div className="absolute left-0 bottom-full mb-1.5 w-64 p-2.5 bg-slate-800 text-white text-xs rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {row.errors.map((e, i) => (
                              <p key={i}>{e}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 mb-5">
              <XCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {validCount} of {rows.length} rows ready to import
              {errorCount > 0 && ` (${errorCount} rows with errors will be skipped)`}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("upload")}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                disabled={validCount === 0 || importing}
                className="px-6 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl text-sm font-semibold hover:bg-[#0955db] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing {importProgress}...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Import {validCount} Member{validCount !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
