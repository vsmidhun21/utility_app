import React from "react";
import { Link } from "react-router-dom";
import construction from "../../../public/under-construction.png";

export default function UnderConstruction() {

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-6 py-12">
            <div className="max-w-3xl w-full text-center">
                {/* Image (vector/illustration) */}
                <div className="flex justify-center mb-8">
                    <img
                        src={construction}
                        alt="Under construction illustration"
                        className="w-80 h-auto sm:w-80 md:w-100"
                        style={{ imageRendering: "optimizeQuality" }}
                    />
                </div>

                {/* Title & description */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                    Page Under Construction
                </h1>
                <p className="text-base sm:text-lg text-slate-600 mb-8">
                    We're working on something awesome. We’ll be ready soon — thanks for your patience!
                </p>

                {/* Button to go home */}
                <div className="flex justify-center">
                    <div>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            aria-label="Go to home"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                            </svg>
                            Back to Home
                        </Link>
                    </div>

                    <div className="ml-4">
                        <Link
                            to="/contact" style={{ background: "#e8eafd" }}
                            className="inline-flex items-center gap-2 rounded-md text-black px-6 py-3 text-base font-semibold shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            aria-label="Contact Support"
                        >
                            Contact Support
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
                            </svg>

                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
}
