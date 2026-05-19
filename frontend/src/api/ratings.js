const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

// Carries the HTTP status so callers can distinguish auth failures (401)
// from generic errors and react accordingly.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// GET /ratings/{userId} — every rating the user has made (JWT-protected).
export const getUserRatings = async ({ userId, token }) => {
  const res = await fetch(`${BASE_URL}/ratings/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(body || `Request failed with status ${res.status}`, res.status);
  }

  return res.json(); // [{ ratingId, movieId, movieTitle, stars }]
};

// POST /ratings — creates a rating, or updates it if one already exists
// for this user/movie (the backend upserts on user_id + movie_id).
export const rateMovie = async ({ movieId, stars, token }) => {
  const res = await fetch(`${BASE_URL}/ratings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ movieId, stars }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(body || `Request failed with status ${res.status}`, res.status);
  }

  return res.json(); // { id, userId, username, movieId, movieTitle, stars }
};
