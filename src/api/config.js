/** Ensures API base URL always ends with /api (matches FastAPI router prefix). */
export function getApiBaseUrl() {
    const raw = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8001/api").trim()
    const base = raw.replace(/\/+$/, "")

    if (base.endsWith("/api")) {
        return base
    }

    return `${base}/api`
}

/** Turns FastAPI / axios errors into a readable string for the UI. */
export function getApiErrorMessage(error, fallback = "Something went wrong") {
    const detail = error?.response?.data?.detail

    if (typeof detail === "string") {
        return detail
    }

    if (Array.isArray(detail)) {
        return detail
            .map((item) => item?.msg || item?.message || JSON.stringify(item))
            .join(". ")
    }

    if (detail && typeof detail === "object") {
        return detail.message || JSON.stringify(detail)
    }

    if (!error?.response) {
        return "Unable to reach the server. Check your connection and try again."
    }

    return fallback
}
