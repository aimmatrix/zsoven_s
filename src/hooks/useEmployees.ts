"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/lib/types";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
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
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  return { employees, loading, error, refetch };
}
