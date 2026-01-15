
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook for intelligent backward navigation.
 * Handles the "Back" and "Close" actions by checking traversal history.
 */
export function useSmartNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Safely navigates back in the history stack.
     * If there is no history (direct entry/new tab), navigates to the fallback path.
     * 
     * @param fallbackPath - Path to redirect to if no history exists (default: "/")
     */
    const goBack = (fallbackPath: string = "/") => {
        // location.key is "default" for the initial entry in the stack.
        // If it's not default, we likely have traversed within the app.
        // We also check window.history.state for robustness if available.

        const hasHistory = location.key !== "default";

        if (hasHistory) {
            navigate(-1);
        } else {
            navigate(fallbackPath, { replace: true });
        }
    };

    /**
     * Specific handler for "Close" actions (modals/drawers).
     * Semantically different from "Back" but often implemented similarly.
     * Can be extended to handle window.close() for popups.
     */
    const closeView = (fallbackPath: string = "/") => {
        if (window.opener) {
            window.close();
            return;
        }
        goBack(fallbackPath);
    };

    return { goBack, closeView };
}
