"use client";

import { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

export default function EmployeesPage() {
  const { employees, loading, refetch } = useEmployees();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", basic_pay: 0, working_days: 26, ot_divisor: 8 });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEdit = (emp: Employee) => {
    setEditing(emp.id);
    setForm({
      name: emp.name,
      basic_pay: emp.basic_pay,
      working_days: emp.working_days,
      ot_divisor: emp.ot_divisor,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    await supabase
      .from("employees")
      .update({
        name: form.name,
        basic_pay: form.basic_pay,
        working_days: form.working_days,
        ot_divisor: form.ot_divisor,
      })
      .eq("id", editing);
    setEditing(null);
    setSaving(false);
    refetch();
  };

  const addEmployee = async () => {
    setSaving(true);
    const maxOrder = employees.reduce(
      (max, e) => Math.max(max, e.sort_order),
      0
    );
    await supabase.from("employees").insert({
      name: form.name,
      basic_pay: form.basic_pay,
      working_days: form.working_days,
      ot_divisor: form.ot_divisor,
      sort_order: maxOrder + 1,
    });
    setAdding(false);
    setForm({ name: "", basic_pay: 0, working_days: 26, ot_divisor: 8 });
    setSaving(false);
    refetch();
  };

  const toggleActive = async (emp: Employee) => {
    await supabase
      .from("employees")
      .update({ is_active: !emp.is_active })
      .eq("id", emp.id);
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/" className="text-sm text-blue-600 hover:text-blue-800">
              &larr; Home
            </a>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              Manage Employees
            </h1>
          </div>
          <button
            onClick={() => {
              setAdding(true);
              setEditing(null);
              setForm({ name: "", basic_pay: 0, working_days: 26, ot_divisor: 8 });
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Employee
          </button>
        </div>

        {/* Add Employee Form */}
        {adding && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">New Employee</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Basic Pay</label>
                <input
                  type="number"
                  value={form.basic_pay || ""}
                  onChange={(e) => setForm({ ...form, basic_pay: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Working Days</label>
                <input
                  type="number"
                  value={form.working_days}
                  onChange={(e) => setForm({ ...form, working_days: Number(e.target.value) || 26 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Shift Hours (OT Divisor)</label>
                <input
                  type="number"
                  value={form.ot_divisor}
                  onChange={(e) => setForm({ ...form, ot_divisor: Number(e.target.value) || 8 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={addEmployee}
                disabled={saving || !form.name}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add"}
              </button>
              <button
                onClick={() => setAdding(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {employees.map((emp, i) => (
            <div key={emp.id} className="p-4">
              {editing === emp.id ? (
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Basic Pay</label>
                      <input
                        type="number"
                        value={form.basic_pay || ""}
                        onChange={(e) => setForm({ ...form, basic_pay: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Working Days</label>
                      <input
                        type="number"
                        value={form.working_days}
                        onChange={(e) => setForm({ ...form, working_days: Number(e.target.value) || 26 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Shift Hours (OT Divisor)</label>
                      <input
                        type="number"
                        value={form.ot_divisor}
                        onChange={(e) => setForm({ ...form, ot_divisor: Number(e.target.value) || 8 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                      <span className="font-medium text-gray-900">{emp.name}</span>
                    </div>
                    <div className="flex gap-4 mt-1 ml-7">
                      <span className="text-xs text-gray-500">
                        Pay: {formatCurrency(emp.basic_pay)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Days: {emp.working_days}
                      </span>
                      <span className="text-xs text-gray-500">
                        Shift: {emp.ot_divisor}h
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(emp)}
                    className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
