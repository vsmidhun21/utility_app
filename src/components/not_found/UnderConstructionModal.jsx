// UnderConstructionModal.jsx
import React, { useEffect } from "react";
import construction from "../../../public/under-construction.png"; // adjust path if needed
import { Link } from "react-router-dom";

export default function UnderConstructionModal({ open, onClose }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            aria-label="Under Construction"
        >



            {/* backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* modal card */}
            <div className="relative z-10 max-w-xl w-full mx-4 bg-white rounded-lg shadow-xl overflow-hidden">

                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-3 right-3 rounded-full p-1 bg-white/90 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 shadow"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>

                </button>

                <div className="p-6 md:p-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src={construction}
                            alt="Under construction"
                            className="w-56 h-auto"
                            style={{ imageRendering: "optimizeQuality" }}
                        />
                    </div>

                    <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-2">
                        Process Under Construction
                    </h2>

                    <p className="text-sm text-slate-600 text-center mb-6">
                        We're working on something awesome. We’ll be ready soon!
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <Link
                            to="/"
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                            </svg>
                            Back to Home
                        </Link>

                        <Link
                            to="/contact"
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 shadow hover:bg-slate-200"
                        >
                            Contact Support
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
                            </svg>

                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
