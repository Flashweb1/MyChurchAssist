"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { Loader2, UploadCloud, Download } from "lucide-react";

export default function MemberBulkUpload({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = "firstName,lastName,email,phone\nJohn,Doe,john@example.com,1234567890\nJane,Smith,jane@example.com,0987654321";
    const blob = new Blob([headers], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "members_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");

    // 1. Parse the CSV file
    Papa.parse(file, {
      header: true, // Converts rows to objects based on the first row headers
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const members = results.data as any[];
          
          if (members.length === 0) {
            throw new Error("The CSV file is empty.");
          }

          const membersRef = collection(db, "members");
          const validMembers = members.filter((m) => m.firstName || m.lastName);

          if (validMembers.length === 0) {
            throw new Error("No valid member data found in the CSV. Please check your headers.");
          }

          // 2. Prepare Firestore Batches (Max 500 writes per batch)
          const CHUNK_SIZE = 500;
          let addedCount = 0;

          for (let i = 0; i < validMembers.length; i += CHUNK_SIZE) {
            const chunk = validMembers.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);

            chunk.forEach((member) => {
              const newMemberRef = doc(membersRef); // auto-generate ID
              batch.set(newMemberRef, {
                firstName: member.firstName || "",
                lastName: member.lastName || "",
                email: member.email || "",
                phone: member.phone || "",
                createdAt: new Date().toISOString(),
                status: "active",
                // Add any other default fields your app requires
              });
              addedCount++;
            });

            // 3. Commit the batch to Firestore
            await batch.commit();
          }

          setSuccessMsg(`Successfully imported ${addedCount} members!`);
          if (onSuccess) onSuccess();

        } catch (err: any) {
          console.error("Bulk upload error:", err);
          setError(err.message || "Failed to upload members. Please check the file format.");
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
        }
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setLoading(false);
      }
    });
  };

  return (
    <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-white shadow-sm rounded-full">
          <UploadCloud className="w-8 h-8 text-[var(--brand-blue)]" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Bulk Import Members</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
        Upload a CSV file containing your members. Please ensure the file has headers like <code className="bg-slate-200 px-1 rounded">firstName</code>, <code className="bg-slate-200 px-1 rounded">lastName</code>, and <code className="bg-slate-200 px-1 rounded">email</code>.
      </p>

      <div className="mb-6">
        <button onClick={downloadTemplate} type="button" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-blue)] hover:text-[#0955db] transition-colors">
          <Download className="w-4 h-4" /> Download CSV Template
        </button>
      </div>
      
      {error && <div className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded">{error}</div>}
      {successMsg && <div className="text-emerald-600 text-sm mb-4 bg-emerald-50 p-2 rounded">{successMsg}</div>}

      <label className="relative inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-colors rounded-xl bg-[var(--brand-blue)] hover:bg-[#0955db] cursor-pointer disabled:opacity-50">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {loading ? "Importing..." : "Select CSV File"}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </label>
    </div>
  );
}