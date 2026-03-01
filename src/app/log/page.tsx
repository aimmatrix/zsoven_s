"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEmployees } from "@/hooks/useEmployees";

const DEDUCTION_TYPES = [
  { value: "penalty", label: "Penalty" },
  { value: "loan", label: "Loan" },
  { value: "sales_credit", label: "Sales Credit" },
  { value: "iou", label: "I.O.U" },
] as const;

type DeductionType = (typeof DEDUCTION_TYPES)[number]["value"];

interface DeductionLog {
  id: string;
  employee_id: string;
  type: string;
  amount: number;
  description: string;
  event_date: string;
  created_at: string;
  employees?: { name: string };
}

export default function LogPage() {
  const router = useRouter();
  const { employees, loading: empLoading } = useEmployees();

  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<DeductionType>("penalty");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [recentLogs, setRecentLogs] = useState<DeductionLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Fetch recent logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from("deduction_logs")
      .select("*, employees(name)")
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);
    setRecentLogs(data || []);
    setLogsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Set default employee when loaded
  useEffect(() => {
    if (employees.length > 0 && !employeeId) {
      setEmployeeId(employees[0].id);
    }
  }, [employees, employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !amount) return;

    setSubmitting(true);
    await supabase.from("deduction_logs").insert({
      employee_id: employeeId,
      type,
      amount: Number(amount),
      description,
      event_date: eventDate,
    });

    // Reset form (keep employee and type selected)
    setAmount("");
    setDescription("");
    setSubmitting(false);
    fetchLogs();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("deduction_logs").delete().eq("id", id);
    fetchLogs();
  };

  const typeLabel = (t: string) =>
    DEDUCTION_TYPES.find((d) => d.value === t)?.label || t;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <a
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Dashboard
          </a>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Quick Entry
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Log deductions as they happen
          </p>
        </div>

        {/* Entry Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-amber-500"></div>
            <div className="p-6 space-y-5">
              {/* Employee */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee
                </label>
                <div className="relative">
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none outline-none"
                    required
                  >
                    {empLoading ? (
                      <option>Loading...</option>
                    ) : (
                      employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEDUCTION_TYPES.map((dt) => (
                    <button
                      key={dt.value}
                      type="button"
                      onClick={() => setType(dt.value)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all border ${
                        type === dt.value
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {dt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !employeeId || !amount}
                className="w-full py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Log Entry
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Recent Entries */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Recent Entries
          </h2>

          {logsLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">No entries yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 truncate">
                        {log.employees?.name || "Unknown"}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        {typeLabel(log.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{new Date(log.event_date).toLocaleDateString()}</span>
                      {log.description && (
                        <>
                          <span>&middot;</span>
                          <span className="truncate">{log.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold font-mono text-gray-900">
                      {Number(log.amount).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete entry"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
