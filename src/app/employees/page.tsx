"use client";

import { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

export default function EmployeesPage() {
  const { employees, loading, refetch } = useEmployees();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", basic_pay: 0, working_days: 26, ot_divisor: 8, holiday_entitlement: 14 });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEdit = (emp: Employee) => {
    setEditing(emp.id);
    setForm({
      name: emp.name,
      basic_pay: emp.basic_pay,
      working_days: emp.working_days,
      ot_divisor: emp.ot_divisor,
      holiday_entitlement: emp.holiday_entitlement ?? 14,
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
        holiday_entitlement: form.holiday_entitlement,
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
      holiday_entitlement: form.holiday_entitlement,
      sort_order: maxOrder + 1,
    });
    setAdding(false);
    setForm({ name: "", basic_pay: 0, working_days: 26, ot_divisor: 8, holiday_entitlement: 14 });
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <a href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-2 transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </a>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Manage Employees
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Add, update, or remove personnel records.</p>
          </div>
          <button
            onClick={() => {
              setAdding(true);
              setEditing(null);
              setForm({ name: "", basic_pay: 0, working_days: 26, ot_divisor: 8, holiday_entitlement: 14 });
            }}
            disabled={adding}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Employee
          </button>
        </div>

        {/* Add Employee Form */}
        {adding && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8 transform transition-all duration-300">
            <div className="flex items-center mb-5 border-b border-gray-100 pb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Add New Employee</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                  placeholder="e.g. Jane Doe"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Basic Pay (Monthly)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={form.basic_pay || ""}
                    onChange={(e) => setForm({ ...form, basic_pay: Number(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Working Days</label>
                <input
                  type="number"
                  value={form.working_days}
                  onChange={(e) => setForm({ ...form, working_days: Number(e.target.value) || 26 })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shift Hours (OT Divisor)</label>
                <input
                  type="number"
                  value={form.ot_divisor}
                  onChange={(e) => setForm({ ...form, ot_divisor: Number(e.target.value) || 8 })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Holiday Entitlement (Days/Year)</label>
                <input
                  type="number"
                  value={form.holiday_entitlement}
                  onChange={(e) => setForm({ ...form, holiday_entitlement: Number(e.target.value) || 14 })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setAdding(false)}
                className="px-5 py-2.5 text-gray-700 font-medium bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addEmployee}
                disabled={saving || !form.name}
                className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  </>
                ) : "Save Employee"}
              </button>
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="space-y-4">
          {employees.length === 0 && !loading && !adding && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No employees found</h3>
              <p className="text-gray-500 mb-4 text-sm max-w-sm mx-auto">Get started by adding your first employee to manage their salary and attendance.</p>
              <button
                onClick={() => setAdding(true)}
                className="text-blue-600 font-medium text-sm hover:text-blue-800"
              >
                + Add an employee
              </button>
            </div>
          )}

          {employees.map((emp, i) => (
            <div
              key={emp.id}
              className={`bg-white rounded-2xl shadow-sm border ${editing === emp.id ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-200 hover:border-gray-300'} overflow-hidden transition-all duration-200`}
            >
              {editing === emp.id ? (
                <div className="p-6">
                  <div className="flex items-center mb-5 pb-4 border-b border-gray-100">
                    <div className="bg-blue-50 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Edit {emp.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Basic Pay</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          value={form.basic_pay || ""}
                          onChange={(e) => setForm({ ...form, basic_pay: Number(e.target.value) || 0 })}
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Working Days</label>
                      <input
                        type="number"
                        value={form.working_days}
                        onChange={(e) => setForm({ ...form, working_days: Number(e.target.value) || 26 })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shift Hours (OT Divisor)</label>
                      <input
                        type="number"
                        value={form.ot_divisor}
                        onChange={(e) => setForm({ ...form, ot_divisor: Number(e.target.value) || 8 })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Holiday Entitlement (Days/Year)</label>
                      <input
                        type="number"
                        value={form.holiday_entitlement}
                        onChange={(e) => setForm({ ...form, holiday_entitlement: Number(e.target.value) || 14 })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setEditing(null)}
                      className="px-5 py-2.5 text-gray-700 font-medium bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving || !form.name}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Saving...
                        </>
                      ) : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full font-bold text-gray-500 text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {emp.name}
                        {!emp.is_active && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                            Inactive
                          </span>
                        )}
                      </h4>

                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-gray-500 font-medium mr-1">Pay:</span>
                          <span className="font-semibold text-gray-800">{formatCurrency(emp.basic_pay)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-gray-500 font-medium mr-1">Days:</span>
                          <span className="font-semibold text-gray-800">{emp.working_days}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-gray-500 font-medium mr-1">Shift:</span>
                          <span className="font-semibold text-gray-800">{emp.ot_divisor}h</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-purple-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-gray-500 font-medium mr-1">Holiday:</span>
                          <span className="font-semibold text-gray-800">{emp.holiday_entitlement ?? 14}d</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-14 sm:pl-0">
                    <button
                      onClick={() => toggleActive(emp)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${emp.is_active
                          ? 'text-gray-600 border-gray-200 hover:bg-gray-100'
                          : 'text-green-700 border-green-200 bg-green-50 hover:bg-green-100'
                        }`}
                    >
                      {emp.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => startEdit(emp)}
                      className="px-4 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

