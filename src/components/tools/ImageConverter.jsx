// ImageConverter.jsx
import React, { useEffect, useRef, useState } from "react";
import ToolsNavbar from "../navbar/Navbar"; // adjust path if needed
import ToolsFooter from "../footer/Footer"; // optional: adjust/remove if you don't have it
import uploadimg from "../../../public/upload_image.png"; // placeholder path
import FullscreenLoader from "../loading/Uploading"; // optional loader component (from earlier)
import UnderConstructionModal from "../not_found/UnderConstructionModal"; // adjust path


export default function ImageConverter() {
    const [file, setFile] = useState(null);
    const [origUrl, setOrigUrl] = useState(null);
    const [origSize, setOrigSize] = useState(0);

    const [convertedUrl, setConvertedUrl] = useState(null);
    const [convSize, setConvSize] = useState(0);

    const [format, setFormat] = useState("image/png"); // image/png, image/jpeg, image/webp
    const [quality, setQuality] = useState(0.9); // 0.01 - 1.0 (used only for jpeg/webp)
    const [maxWidth, setMaxWidth] = useState(0); // 0 = keep original width
    const [status, setStatus] = useState("");
    const [processing, setProcessing] = useState(false);

    const fileInputRef = useRef(null);
    const dropRef = useRef(null);

    useEffect(() => {
        return () => {
            if (origUrl) URL.revokeObjectURL(origUrl);
            if (convertedUrl) URL.revokeObjectURL(convertedUrl);
        };
    }, [origUrl, convertedUrl]);

    // Helpers
    const humanFileSize = (bytes) => {
        if (!bytes) return "0 B";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const sizes = ["B", "KB", "MB", "GB"];
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const onFilePicked = (f) => {
        if (!f) return;
        if (origUrl) URL.revokeObjectURL(origUrl);
        if (convertedUrl) {
            URL.revokeObjectURL(convertedUrl);
            setConvertedUrl(null);
            setConvSize(0);
        }
        setFile(f);
        setOrigUrl(URL.createObjectURL(f));
        setOrigSize(f.size);
        setStatus("Ready");
        setProcessing(false);
    };

    const handleFileInput = (e) => {
        setStatus("Uploading...");
        setProcessing(true);
        setTimeout(() => {
            const f = e.target.files[0];
            onFilePicked(f);
        }, 2000); // simulate delay
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        onFilePicked(f);
    };

    const handleDragOver = (e) => e.preventDefault();

    // core convert
    async function convertImage(fileObj, outMime, q = 0.9, maxW = 0) {
        setProcessing(true);
        setStatus("Converting...");
        try {
            // load image
            const img = new Image();
            img.src = URL.createObjectURL(fileObj);
            await new Promise((resolve, reject) => {
                img.onload = () => resolve(true);
                img.onerror = (err) => reject(err);
            });

            // compute target size
            let targetW = img.width;
            let targetH = img.height;
            if (maxW > 0 && img.width > maxW) {
                targetW = maxW;
                targetH = Math.round((maxW * img.height) / img.width);
            }

            // create canvas
            const canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext("2d");

            // if converting to jpeg (no alpha), fill white background to avoid black background
            if (outMime === "image/jpeg") {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                // transparent background for png/webp
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            // draw image (preserve aspect ratio by using computed size)
            ctx.drawImage(img, 0, 0, targetW, targetH);

            // toBlob (quality applies only to jpeg/webp)
            const blob = await new Promise((resolve) =>
                canvas.toBlob(
                    resolve,
                    outMime,
                    outMime === "image/png" ? undefined : Math.min(Math.max(q, 0.01), 1)
                )
            );

            if (!blob) throw new Error("Conversion failed (toBlob returned null)");

            // create url
            const url = URL.createObjectURL(blob);
            // revoke previous if any
            if (convertedUrl) URL.revokeObjectURL(convertedUrl);
            setConvertedUrl(url);
            setConvSize(blob.size);
            setStatus("Converted");
            setProcessing(false);
            return blob;
        } catch (err) {
            console.error(err);
            setStatus("Conversion error");
            setProcessing(false);
            throw err;
        }
    }

    const handleConvertClick = async () => {
        if (!file) return alert("Choose an image first");
        await convertImage(file, format, quality, maxWidth);
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleDownloadConverted = async () => {
        if (!file) return alert("Choose an image first");
        setProcessing(true);
        try {
            const blob = await convertImage(file, format, quality, maxWidth);
            // const ext =
            //     format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
            const ext =
                format === "image/png" ? "png" :
                    format === "image/jpeg" ? "jpg" :
                        format === "image/webp" ? "webp" :
                            format === "gif" ? "gif" :
                                "ico";

            const base = file.name.replace(/\.[^/.]+$/, "");
            downloadBlob(blob, `${base}_converted.${ext}`);
            setProcessing(false);
        } catch (e) {
            console.log(e);
            setProcessing(false);
        }
    };

    const [showUnderConstruction, setShowUnderConstruction] = useState(false);

    // when format changed we may show modal for gif/ico
    const handleFormatChange = (newFormat) => {
        setFormat(newFormat);
        if (newFormat === "gif" || newFormat === "ico") {
            setShowUnderConstruction(true);
        }
    };


    // UI render
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <ToolsNavbar />

            <main className="p-6 ">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    Image Converter
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                    </svg>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Original card */}
                    <section className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex flex-col"
                        onDrop={handleDrop} onDragOver={handleDragOver} ref={dropRef}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                Original
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            <div className="text-xs text-gray-400">{humanFileSize(origSize)}</div>
                        </div>

                        <div className="w-full h-64 bg-gray-900 border border-dashed border-gray-700 rounded flex items-center justify-center overflow-hidden relative">
                            {origUrl ? (
                                <>
                                    <img
                                        src={origUrl}
                                        alt="original"
                                        style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInput}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title="Drop or click to upload"
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center gap-3 text-center px-3">
                                        <img src={uploadimg} alt="placeholder" className="max-h-28 opacity-60 object-contain" />
                                        <div className="text-gray-300 font-medium">Drop an image here</div>
                                        <div className="text-xs text-gray-400">or click to select a file</div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInput}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title="Drop or click to upload"
                                    />
                                </>
                            )}
                        </div>

                        {/* upload button */}
                        <div className="mt-3 flex items-center justify-center">
                            <button
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition flex items-center gap-2"
                            >
                                Upload
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>
                            </button>
                        </div>
                    </section>

                    {/* Middle: Controls */}
                    <aside className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex flex-col gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                Controls
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                                </svg>

                            </span>
                        </label>

                        <div>

                            <label className="block text-sm text-gray-200 font-medium mb-2">Output format</label>

                            <div className="grid grid-cols-5 gap-2">

                                {/* PNG */}
                                <label className={`px-3 py-2 rounded cursor-pointer text-sm ${format === "image/png" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                                    <input type="radio" name="format" value="image/png" className="hidden"
                                        checked={format === "image/png"} onChange={() => setFormat("image/png")} />
                                    PNG
                                </label>

                                {/* JPEG */}
                                <label className={`px-3 py-2 rounded cursor-pointer text-sm ${format === "image/jpeg" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                                    <input type="radio" name="format" value="image/jpeg" className="hidden"
                                        checked={format === "image/jpeg"} onChange={() => setFormat("image/jpeg")} />
                                    JPG
                                </label>

                                {/* WEBP */}
                                <label className={`px-3 py-2 rounded cursor-pointer text-sm ${format === "image/webp" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                                    <input type="radio" name="format" value="image/webp" className="hidden"
                                        checked={format === "image/webp"} onChange={() => setFormat("image/webp")} />
                                    WebP
                                </label>

                                {/* GIF */}
                                <label className={`px-3 py-2 rounded cursor-pointer text-sm ${format === "gif" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                                    <input type="radio" name="format" value="gif" className="hidden"
                                        checked={format === "gif"} onChange={() => handleFormatChange("gif")} />
                                    GIF
                                </label>

                                {/* ICO */}
                                <label className={`px-3 py-2 rounded cursor-pointer text-sm ${format === "ico" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                                    <input type="radio" name="format" value="ico" className="hidden"
                                        checked={format === "ico"} onChange={() => handleFormatChange("ico")} />
                                    ICO
                                </label>

                            </div>

                        </div>

                        <div>
                            {format === "image/png" ? (
                                <>
                                    <label className="block text-sm text-gray-200 font-medium mb-2">Quality: 100%</label>
                                    <div className="text-xs text-gray-400 mt-1 mb-1">PNG is lossless; quality slider ignored.</div>
                                </>
                            ) : (
                                <>
                                    <label className="block text-sm text-gray-200 font-medium mb-1">Quality: {(quality * 100).toFixed(0)}%</label>
                                    <input
                                        type="range"
                                        min={1}
                                        max={100}
                                        value={Math.round(quality * 100)}
                                        onChange={(e) => setQuality(Number(e.target.value) / 100)}
                                        className="w-full"
                                        disabled={format === "image/png"} // PNG doesn't use quality
                                    />
                                </>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-200 font-medium mb-2 flex items-center gap-1">
                                Max width (px)
                                <div className="text-xs text-gray-400 mt-1">Set 0 to keep original width.</div>
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={maxWidth}
                                onChange={(e) => setMaxWidth(Number(e.target.value))}
                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                                placeholder="0 to keep original size"
                            />

                        </div>

                        <div className="flex flex-col md:flex-row gap-2 items-center justify-center w-full">
                            <button
                                onClick={handleConvertClick}
                                className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={!file || processing}
                            >
                                Convert
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>

                            </button>

                            <button
                                onClick={handleDownloadConverted}
                                className="px-3 py-2 rounded bg-emerald-500 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={!file || processing}
                            >
                                Download
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </button>

                            <button
                                onClick={() => {
                                    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
                                    setConvertedUrl(null);
                                    setConvSize(0);
                                    setStatus("Cleared");
                                    setFile(null);
                                    if (origUrl) URL.revokeObjectURL(origUrl);
                                    setOrigUrl(null);
                                    setOrigSize(0);
                                }}
                                className="px-3 py-2 rounded bg-gray-600 text-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={!file || processing}
                            >
                                Clear
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-2 text-sm text-gray-300 w-full">
                            <div className="flex items-center justify-between">
                                <div>Original: <strong>{humanFileSize(origSize)}</strong></div>
                                <div>Converted: <strong>{humanFileSize(convSize)}</strong></div>
                            </div>
                            <div className="text-xs text-gray-400 text-center mt-2">{status}</div>
                        </div>
                    </aside>

                    {/* Right: Converted preview */}
                    <section className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                Converted
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                </svg>
                            </div>
                            <div className="text-xs text-gray-400">{humanFileSize(convSize)}</div>
                        </div>

                        <div className="w-full h-64 bg-gray-900 rounded border border-gray-700 flex items-center justify-center overflow-hidden">
                            {convertedUrl ? (
                                <img
                                    src={convertedUrl}
                                    alt="converted"
                                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                                />
                            ) : (
                                <div className="text-gray-400 text-sm">Converted output will appear here after conversion.</div>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-2">
                            <button
                                onClick={() => {
                                    if (convertedUrl) {
                                        // trigger download of current converted blob
                                        fetch(convertedUrl)
                                            .then(r => r.blob())
                                            .then(blob => {
                                                const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
                                                const name = (file ? file.name.replace(/\.[^/.]+$/, "") : "image") + `_converted.${ext}`;
                                                downloadBlob(blob, name);
                                            });
                                    } else if (file) {
                                        handleDownloadConverted();
                                    }
                                }}
                                className="px-3 py-2 rounded bg-emerald-500 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={!file || processing}
                            >
                                Download
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            <div className="mt-14"></div>
            <ToolsFooter />

            <FullscreenLoader show={processing} message={status || "Processing..."} />

            <UnderConstructionModal open={showUnderConstruction}
                onClose={() => {
                    setShowUnderConstruction(false);
                    setFormat("image/png");
                }}
            />
        </div>
    );
}
