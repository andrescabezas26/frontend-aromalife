// Ensure the API base URL is an absolute URL
const getApiBaseURL = () => {
  let baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  // If the URL doesn't start with http/https, it's likely a relative Railway URL
  if (!baseURL.startsWith("http")) {
    baseURL = `https://${baseURL}`;
  }

  return baseURL;
};

const API_BASE_URL = getApiBaseURL();

export async function getIntendedImpacts() {
  const response = await fetch(`${API_BASE_URL}/intended-impacts`);

  if (!response.ok) {
    throw new Error("Failed to fetch intended impacts");
  }

  return response.json();
}

export async function getIntendedImpactsWithMainOption() {
  const response = await fetch(
    `${API_BASE_URL}/intended-impacts/with-main-option`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch intended impacts with main options");
  }

  return response.json();
}
