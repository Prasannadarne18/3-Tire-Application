/**
 * Data Tier — all HTTP calls to the Spring Boot backend.
 * Maps 1-to-1 with GuestController endpoints.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // GET /api/guests?search=&status=
  listGuests:   (search = "", status = "All") =>
    request(`/guests?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`),

  // GET /api/guests/stats
  getStats:     () => request("/guests/stats"),

  // POST /api/guests
  createGuest:  (guest) => request("/guests", { method: "POST", body: JSON.stringify(guest) }),

  // PUT /api/guests/:id
  updateGuest:  (id, guest) => request(`/guests/${id}`, { method: "PUT", body: JSON.stringify(guest) }),

  // PATCH /api/guests/:id/status
  updateStatus: (id, status) =>
    request(`/guests/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // DELETE /api/guests/:id
  deleteGuest:  (id) => request(`/guests/${id}`, { method: "DELETE" }),
};
