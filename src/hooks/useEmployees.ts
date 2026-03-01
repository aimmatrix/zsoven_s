"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/lib/types";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("employees")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setEmployees(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { employees, loading, error, refetch: fetchEmployees };
}
