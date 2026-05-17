const MAX_ENTRIES = 200

function storageKey() {
    const managerEmail = localStorage.getItem("email") || "unknown"

    return `manager_review_history_${managerEmail}`
}

export function snapshotFromGoal(goal) {
    return {
        title: goal.title ?? "",
        description: goal.description ?? "",
        thrust_area: goal.thrust_area ?? "",
        target_value: goal.target_value ?? "",
        weightage: goal.weightage ?? "",
        uom: goal.uom ?? "",
        status: goal.status ?? "",
    }
}

export function loadManagerReviewHistory() {
    try {
        const raw = localStorage.getItem(storageKey())
        const parsed = raw ? JSON.parse(raw) : []
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function saveManagerReviewHistory(entries) {
    localStorage.setItem(
        storageKey(),
        JSON.stringify(entries.slice(0, MAX_ENTRIES))
    )
}

export function addManagerReviewEntry({
    goalId,
    employeeEmail,
    action,
    goalSnapshot,
    comment = "",
    rejectionReason = "",
}) {
    const history = loadManagerReviewHistory()

    const entry = {
        id: `${goalId}-${action}-${Date.now()}`,
        goalId,
        employeeEmail: employeeEmail || "Unknown",
        action,
        goalSnapshot,
        comment: comment || "",
        rejectionReason: rejectionReason || "",
        reviewedAt: new Date().toISOString(),
        managerEmail: localStorage.getItem("email") || "",
    }

    const updated = [entry, ...history]
    saveManagerReviewHistory(updated)
    return updated
}

export function recordSubmissionReceived(goal) {
    if (!goal?.id) return loadManagerReviewHistory()

    const history = loadManagerReviewHistory()
    const alreadyLogged = history.some(
        (entry) =>
            entry.goalId === goal.id &&
            entry.action === "submitted" &&
            entry.goalSnapshot?.status === goal.status
    )

    if (alreadyLogged) return history

    return addManagerReviewEntry({
        goalId: goal.id,
        employeeEmail: goal.employee_email,
        action: "submitted",
        goalSnapshot: snapshotFromGoal(goal),
    })
}

export function recordReviewDecision(goal, action, { comment = "", rejectionReason = "" } = {}) {
    if (!goal?.id) return loadManagerReviewHistory()

    return addManagerReviewEntry({
        goalId: goal.id,
        employeeEmail: goal.employee_email,
        action,
        goalSnapshot: snapshotFromGoal({
            ...goal,
            status: action === "approved" ? "approved" : action === "rejected" ? "rejected" : goal.status,
        }),
        comment,
        rejectionReason,
    })
}

export function clearManagerReviewHistory() {
    localStorage.removeItem(storageKey())
    return []
}
