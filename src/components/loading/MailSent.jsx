// src/components/LoadingOverlay.jsx
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Loading({ show = false }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-48 h-48 flex items-center justify-center">
                <DotLottieReact
                    src="https://lottie.host/7a5e981d-db85-4895-ad86-96a041cc7ae5/fN1P5sJJvt.lottie"
                    autoplay
                />
            </div>
        </div>
    );
}
