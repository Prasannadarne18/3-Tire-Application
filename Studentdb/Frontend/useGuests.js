/**
 * Business Logic Tier — React hook that owns all domain logic.
 * Replaces the inline JS functions from VanRaj_Hotel_Management.jsx
 * and wires them to the real backend via the api utility.
 */

import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

export const ROOM_PRICES = {
  Standard: 1400,
  Deluxe: 2200,
  Suite: 3500,
  Presidential: 7000,
};

export function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000));
}

export function autoAmount(type, checkIn, checkOut) {
  return calcNights(checkIn, checkOut) * (ROOM_PRICES[type] || 0);
}

export const EMPTY_FORM = {
  name: "", room: "", type: "Deluxe",
  checkIn: "", checkOut: "", mobile: "", amount: "",
};

export function useGuests() {
  const [guests,      setGuests]      = useState([]);
  const [stats,       setStats]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [filterStatus, setFilter]     = useState("All");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  // ── Fetch guests from backend ─────────────────────────────────────────────
  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, statsData] = await Promise.all([
        api.listGuests(search, filterStatus),
        api.getStats(),
      ]);
      setGuests(data);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const createGuest = async (formData) => {
    await api.createGuest(formData);
    await fetchGuests();
  };

  const updateGuest = async (id, formData) => {
    await api.updateGuest(id, formData);
    await fetchGuests();
  };

  const updateStatus = async (id, status) => {
    await api.updateStatus(id, status);
    await fetchGuests();
  };

  const deleteGuest = async (id) => {
    await api.deleteGuest(id);
    await fetchGuests();
  };

  return {
    guests, stats, search, setSearch,
    filterStatus, setFilter,
    loading, error,
    createGuest, updateGuest, updateStatus, deleteGuest,
    refresh: fetchGuests,
  };
}
