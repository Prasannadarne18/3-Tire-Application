/**
 * VanRaj Royal Hotel Management System
 *
 * Presentation Tier — migrated from VanRaj_Hotel_Management.jsx
 * Now backed by Spring Boot REST API + PostgreSQL.
 */

import { useState } from "react";
import { useGuests, autoAmount, calcNights, ROOM_PRICES, EMPTY_FORM } from "./hooks/useGuests";

// ── Shared atoms ──────────────────────────────────────────────────────────────

function initials(name) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ name, size = 32 }) {
  const colors = ["#7F77DD","#1D9E75","#D85A30","#D4537E","#378ADD","#639922","#BA7517","#E24B4A"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: colors[idx],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 600, color: "#fff", flexShrink: 0
    }}>{initials(name)}</div>
  );
}

function Badge({ status }) {
  const bg    = { "Checked-in": "#0f2e1e", "Reserved": "#2e1f00", "Checked-out": "#1c1c1c" }[status] || "#222";
  const color = { "Checked-in": "#22c27a", "Reserved": "#f59e0b", "Checked-out": "#9ca3af" }[status] || "#aaa";
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 5, border: `1px solid ${color}30` }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 10, padding: "14px 18px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent || "#a89cf7", letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6b6b8a", marginTop: 3, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

const STATUS_COLORS = { "Checked-in": "#1a9e5c", "Reserved": "#c97b00", "Checked-out": "#6b7280" };

// ── Main component ────────────────────────────────────────────────────────────

export default function App() {
  const {
    guests, stats, search, setSearch, filterStatus, setFilter,
    loading, error, createGuest, updateGuest, updateStatus, deleteGuest,
  } = useGuests();

  const [activeView,   setActiveView]   = useState("dashboard");
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [editId,       setEditId]       = useState(null);
  const [toast,        setToast]        = useState(null);
  const [showTierInfo, setShowTierInfo] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleFormChange = (field, val) => {
    setForm(prev => {
      const updated = { ...prev, [field]: val };
      if (["type","checkIn","checkOut"].includes(field)) {
        updated.amount = autoAmount(updated.type, updated.checkIn, updated.checkOut);
      }
      return updated;
    });
  };

  const saveBooking = async () => {
    if (!form.name || !form.room || !form.checkIn || !form.checkOut || !form.mobile) {
      showToast("Please fill all required fields", "error"); return;
    }
    try {
      if (editId) {
        await updateGuest(editId, form);
        showToast("Booking updated successfully");
        setEditId(null);
      } else {
        await createGuest(form);
        showToast("Room booked successfully!");
      }
      setForm(EMPTY_FORM);
      setActiveView("dashboard");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGuest(id);
      showToast("Booking deleted", "error");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleEditGuest = (g) => {
    setForm({ name: g.name, room: g.room, type: g.type, checkIn: g.checkIn?.slice(0,10), checkOut: g.checkOut?.slice(0,10), mobile: g.mobile, amount: g.amount });
    setEditId(g.id);
    setActiveView("booking");
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus(id, status);
      showToast(`Status updated to ${status}`);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const navTo = (view) => {
    setActiveView(view);
    setEditId(null);
    if (view === "booking") setForm(EMPTY_FORM);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: "#0a0a14", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#e2e0f0" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 18, right: 18, zIndex: 999,
          background: toast.type === "error" ? "#2e0f0f" : "#0f2e1e",
          border: `1px solid ${toast.type === "error" ? "#e24b4a" : "#22c27a"}`,
          color: toast.type === "error" ? "#f87171" : "#22c27a",
          padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 20px #00000060"
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ background: "#0e0e1e", borderBottom: "1px solid #1e1e35", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#7F77DD,#4f46b8)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>♛</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#a89cf7", letterSpacing: 1.5 }}>VANRAJ</div>
            <div style={{ fontSize: 9, color: "#4e4e6e", letterSpacing: 2, textTransform: "uppercase" }}>Royal Hotel Management</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["dashboard","⊞","Dashboard"],["booking","＋","New Booking"],["guests","☰","All Guests"]].map(([v, icon, label]) => (
            <button key={v} onClick={() => navTo(v)}
              style={{ background: activeView === v ? "#1e1e35" : "transparent", border: "none", color: activeView === v ? "#a89cf7" : "#5c5c80", cursor: "pointer", padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14 }}>{icon}</span> {label}
            </button>
          ))}
          <button onClick={() => setShowTierInfo(t => !t)} style={{ background: "#1a1a2e", border: "1px solid #2a2a42", color: "#7b7baa", cursor: "pointer", padding: "4px 12px", borderRadius: 7, fontSize: 11, marginLeft: 8 }}>3-Tier Info</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c27a", boxShadow: "0 0 6px #22c27a" }}></div>
          <span style={{ fontSize: 11, color: "#4e4e6e" }}>LIVE | {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
        </div>
      </div>

      {/* 3-Tier Info Panel */}
      {showTierInfo && (
        <div style={{ background: "#0e0e1e", borderBottom: "1px solid #1e1e35", padding: "16px 24px", display: "flex", gap: 20 }}>
          {[
            { tier: "Tier 1", label: "Presentation",   color: "#7F77DD", desc: "React UI — forms, tables, dashboard, navigation, search, filters." },
            { tier: "Tier 2", label: "Business Logic",  color: "#1D9E75", desc: "Spring Boot Services + React hooks — validation, auto-pricing, status rules." },
            { tier: "Tier 3", label: "Data Layer",      color: "#D85A30", desc: "PostgreSQL + JPA repository — persistent guest records, full CRUD." },
          ].map(t => (
            <div key={t.tier} style={{ flex: 1, background: "#13131f", border: `1px solid ${t.color}30`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, color: t.color, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>{t.tier}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#d0cfe8", margin: "4px 0 6px" }}>{t.label}</div>
              <div style={{ fontSize: 12, color: "#6b6b8a", lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ background: "#2e0f0f", borderBottom: "1px solid #e24b4a40", color: "#f87171", padding: "10px 24px", fontSize: 13 }}>
          ⚠ {error} — check that the Spring Boot backend is running on port 8080.
        </div>
      )}

      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {activeView === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
              <StatCard label="Total Rooms" value={stats?.totalRooms ?? 50}  accent="#a89cf7" />
              <StatCard label="Occupied"    value={stats?.occupied   ?? "—"} accent="#22c27a" />
              <StatCard label="Available"   value={stats?.available  ?? "—"} accent="#60a5fa" />
              <StatCard label="Revenue"     value={stats ? `₹${(stats.revenue/1000).toFixed(1)}L` : "—"} accent="#f59e0b" />
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4e4e6e", fontSize: 14 }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by guest, room, type, status..."
                  style={{ width: "100%", background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "9px 12px 9px 34px", color: "#e2e0f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              {["All","Checked-in","Reserved","Checked-out"].map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{ background: filterStatus === s ? "#1e1e35" : "transparent", border: `1px solid ${filterStatus === s ? "#4f46b8" : "#2a2a3e"}`, color: filterStatus === s ? "#a89cf7" : "#6b6b8a", cursor: "pointer", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500 }}>{s}</button>
              ))}
            </div>

            <div style={{ background: "#0e0e1e", border: "1px solid #1e1e35", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 100px 90px 110px 80px", padding: "10px 16px", borderBottom: "1px solid #1a1a2e" }}>
                {["#","Guest","Room","Type","Check-out","Status","Actions"].map(h => (
                  <div key={h} style={{ fontSize: 11, color: "#4e4e6e", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</div>
                ))}
              </div>
              {loading && <div style={{ textAlign: "center", padding: "40px", color: "#4e4e6e", fontSize: 14 }}>Loading…</div>}
              {!loading && guests.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#4e4e6e", fontSize: 14 }}>No bookings found</div>}
              {guests.map((g, i) => (
                <div key={g.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 100px 90px 110px 80px", padding: "12px 16px", borderBottom: "1px solid #13131f", alignItems: "center", background: i % 2 === 0 ? "transparent" : "#0b0b17" }}>
                  <div style={{ fontSize: 12, color: "#3e3e5e", fontWeight: 600 }}>0{i+1}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={g.name} size={28} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#d0cfe8" }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: "#4e4e6e" }}>{g.mobile}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#a89cf7" }}>{g.room}</div>
                  <div><span style={{ background: "#1a1a2e", color: "#7b7baa", fontSize: 11, padding: "3px 8px", borderRadius: 5 }}>{g.type}</span></div>
                  <div style={{ fontSize: 12, color: "#6b6b8a" }}>{g.checkOut?.slice(5,10).replace("-","/")||""}</div>
                  <div>
                    <select value={g.status} onChange={e => handleStatusChange(g.id, e.target.value)}
                      style={{ background: "#0a0a14", border: `1px solid ${STATUS_COLORS[g.status]}40`, color: STATUS_COLORS[g.status], fontSize: 11, padding: "3px 6px", borderRadius: 5, cursor: "pointer", outline: "none" }}>
                      {["Checked-in","Reserved","Checked-out"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleEditGuest(g)} style={{ background: "#1a1a35", border: "1px solid #2a2a4e", color: "#a89cf7", cursor: "pointer", padding: "4px 8px", borderRadius: 5, fontSize: 12 }}>✎</button>
                    <button onClick={() => handleDelete(g.id)} style={{ background: "#1e0e0e", border: "1px solid #4e1e1e", color: "#e24b4a", cursor: "pointer", padding: "4px 8px", borderRadius: 5, fontSize: 12 }}>✕</button>
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 16px", borderTop: "1px solid #1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#4e4e6e" }}>Showing {guests.length} booking(s)</span>
                <span style={{ fontSize: 11, color: "#3e3e5e", letterSpacing: 1 }}>VANRAJ Royal Hotel Management System</span>
              </div>
            </div>
          </>
        )}

        {/* BOOKING FORM */}
        {activeView === "booking" && (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#a89cf7" }}>{editId ? "✎ Edit Booking" : "＋ New Booking"}</div>
              <div style={{ fontSize: 12, color: "#4e4e6e" }}>Fill in the details below to {editId ? "update" : "reserve"} a room</div>
            </div>
            <div style={{ background: "#0e0e1e", border: "1px solid #1e1e35", borderRadius: 14, padding: "24px" }}>
              {[
                { label: "Guest Name *", field: "name",    placeholder: "e.g. Rajesh Sharma", type: "text" },
                { label: "Room No. *",   field: "room",    placeholder: "e.g. 101",           type: "text" },
                { label: "Mobile *",     field: "mobile",  placeholder: "e.g. 9876543210",    type: "text" },
                { label: "Check-In *",   field: "checkIn",  type: "date" },
                { label: "Check-Out *",  field: "checkOut", type: "date" },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#5c5c80", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => handleFormChange(field, e.target.value)} placeholder={placeholder}
                    min={type === "date" ? today : undefined}
                    style={{ width: "100%", background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "10px 14px", color: "#e2e0f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, color: "#5c5c80", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>Room Type</label>
                <select value={form.type} onChange={e => handleFormChange("type", e.target.value)}
                  style={{ width: "100%", background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "10px 14px", color: "#e2e0f0", fontSize: 14, outline: "none" }}>
                  {Object.entries(ROOM_PRICES).map(([t, p]) => (
                    <option key={t} value={t}>{t} — ₹{p}/night</option>
                  ))}
                </select>
              </div>
              <div style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 8, padding: "12px 14px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#4e4e6e", textTransform: "uppercase", letterSpacing: 1 }}>Auto-calculated Amount</div>
                  <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 2 }}>{calcNights(form.checkIn, form.checkOut)} nights × ₹{ROOM_PRICES[form.type] || 0}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b" }}>₹{Number(form.amount).toLocaleString("en-IN") || 0}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setActiveView("dashboard"); setEditId(null); }}
                  style={{ flex: 1, background: "transparent", border: "1px solid #2a2a3e", color: "#6b6b8a", cursor: "pointer", padding: "12px", borderRadius: 8, fontSize: 14 }}>Cancel</button>
                <button onClick={saveBooking}
                  style={{ flex: 2, background: "linear-gradient(135deg,#4f46b8,#7F77DD)", border: "none", color: "#fff", cursor: "pointer", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                  {editId ? "▶ Update Booking" : "▶ Book Room"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ALL GUESTS */}
        {activeView === "guests" && (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#a89cf7", marginBottom: 20 }}>All Guests ({guests.length})</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {guests.map(g => (
                <div key={g.id} style={{ background: "#0e0e1e", border: "1px solid #1e1e35", borderRadius: 12, padding: "16px", position: "relative" }}>
                  <div style={{ position: "absolute", top: 14, right: 14 }}><Badge status={g.status} /></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <Avatar name={g.name} size={44} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#d0cfe8" }}>{g.name}</div>
                      <div style={{ fontSize: 12, color: "#4e4e6e" }}>{g.mobile}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[["Room", g.room],["Type", g.type],["Check-in", g.checkIn?.slice(5,10).replace("-","/")],["Check-out", g.checkOut?.slice(5,10).replace("-","/")]].map(([l, v]) => (
                      <div key={l} style={{ background: "#13131f", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "#4e4e6e", textTransform: "uppercase", letterSpacing: 0.8 }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#a89cf7", marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1a1a2e", paddingTop: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>₹{Number(g.amount).toLocaleString("en-IN")}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleEditGuest(g)} style={{ background: "#1a1a35", border: "1px solid #2a2a4e", color: "#a89cf7", cursor: "pointer", padding: "5px 10px", borderRadius: 6, fontSize: 12 }}>Edit</button>
                      <button onClick={() => handleDelete(g.id)} style={{ background: "#1e0e0e", border: "1px solid #4e1e1e", color: "#e24b4a", cursor: "pointer", padding: "5px 10px", borderRadius: 6, fontSize: 12 }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "16px", borderTop: "1px solid #1a1a2e", marginTop: 20 }}>
        <span style={{ fontSize: 10, color: "#2e2e4e", letterSpacing: 1.5, textTransform: "uppercase" }}>
          Backend: Spring Boot :8080 &nbsp;•&nbsp; Frontend: React + Vite :5173 &nbsp;•&nbsp; Data: PostgreSQL :5432 &nbsp;•&nbsp; VanRaj Royal Hotel Management System
        </span>
      </div>
    </div>
  );
}
