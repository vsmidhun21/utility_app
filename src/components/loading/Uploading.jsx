// FullscreenLoader.jsx
import React, { useEffect } from "react";

/**
 * FullscreenLoader
 * Props:
 *   - show: boolean (controls visibility)
 *   - message: optional string shown below spinner
 */
export default function FullscreenLoader({ show = false, message = "Processing..." }) {
    // prevent page scroll while loader is visible
    useEffect(() => {
        if (!show) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev || "";
        };
    }, [show]);

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="status"
            aria-live="polite"
            aria-label="Loading"
        >
            {/* Backdrop: semi-transparent + glass blur */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

            {/* Center card with spinner */}
            <div className="relative z-10 flex flex-col items-center gap-4 p-6 rounded-lg">
                {/* Spinner */}
                <div
                    className="w-20 h-20 border-8 border-gray-600 border-t-indigo-500 rounded-full animate-spin"
                    aria-hidden="true"
                />
                {/* Message */}
                <div className="text-sm text-gray-200">{message}</div>
            </div>
        </div>
    );
}
