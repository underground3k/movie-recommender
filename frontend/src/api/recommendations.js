const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

// GET /recommendations — personalised picks for the logged-in user.
// JWT-protected, so the caller must pass the auth token.
export const getRecommendations = async (token) => {
  const res = await fetch(`${BASE_URL}/recommendations`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json(); // MovieDetailDto[]
};
