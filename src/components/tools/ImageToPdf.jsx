import React, { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolsNavbar from "../navbar/Navbar"; // adjust path if needed
import ToolsFooter from "../footer/Footer"; // optional
import uploading from "../../../public/upload_image.png"; // placeholder
import FullscreenLoader from "../loading/Uploading"; // optional loader
import UnderConstructionModal from "../not_found/UnderConstructionModal"; // adjust path
import BgImg from "../../../public/image_bg.png";

export default function ImageToPdf() {
    const [files, setFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [status, setStatus] = useState("");
    const [processing, setProcessing] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const fileInputRef = useRef(null);

    // page size tab state and modal state
    const [pageSize, setPageSize] = useState("auto"); // "auto" | "A4" | "Letter" | etc.
    const [showUnderConstruction, setShowUnderConstruction] = useState(false);

    // near top of component
    const itemRefs = useRef([]);             // refs for each list row
    const dragIndexRef = useRef(null);       // index of dragging item
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // whenever files change, ensure refs array length matches
    useEffect(() => {
        itemRefs.current = files.map((_, i) => itemRefs.current[i] || React.createRef());
    }, [files]);

    // scroll newly added item into view (call after addFiles finishes)
    useEffect(() => {
        if (!files.length) return;
        // scroll last item into view
        const lastRef = itemRefs.current[files.length - 1];
        if (lastRef && lastRef.current) {
            lastRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [files.length]);


    useEffect(() => {
        return () => {
            files.forEach(f => f.url && URL.revokeObjectURL(f.url));
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    });

    // helper: human size
    const humanFileSize = (bytes) => {
        if (!bytes) return "0 B";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const sizes = ["B", "KB", "MB", "GB"];
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    // handle file(s)
    const addFiles = async (fileList) => {
        const arr = Array.from(fileList || []);
        if (!arr.length) return;
        setStatus("Preparing images...");
        const prepared = await Promise.all(arr.map(async (f) => {
            // create object URL for preview
            const url = URL.createObjectURL(f);
            // load image to get natural dimensions
            const img = new Image();
            img.src = url;
            await new Promise((res, rej) => {
                img.onload = () => res(true);
                img.onerror = rej;
            });
            return {
                file: f,
                url,
                name: f.name,
                size: f.size,
                width: img.naturalWidth,
                height: img.naturalHeight,
            };
        }));
        setFiles(prev => [...prev, ...prepared]);
        setStatus("");
        setProcessing(false);
    };

    const handleFileInput = (e) => {
        setStatus("Uploading...");
        setProcessing(true);
        setTimeout(() => {
            addFiles(e.target.files);
            e.target.value = null; // reset input
        }, 2000); // simulate delay
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const removeAt = (index) => {
        setFiles(prev => {
            const copy = [...prev];
            const [removed] = copy.splice(index, 1);
            if (removed?.url) URL.revokeObjectURL(removed.url);
            return copy;
        });
    };

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // client-side PDF generation using pdf-lib
    const generatePdf = async () => {
        if (!files.length) {
            setAlertMessage("Upload at least one image");
            setAlertOpen(true);
            setProcessing(false);
            return;
        }

        try {
            const pdfDoc = await PDFDocument.create();

            // Optionally add a metadata page or font if you want
            // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            for (const f of files) {
                // Read file as ArrayBuffer
                const arrayBuffer = await f.file.arrayBuffer();

                // detect file type from file.type or extension
                const mime = f.file.type || "";
                let imgEmbed;
                if (mime === "image/png") {
                    imgEmbed = await pdfDoc.embedPng(arrayBuffer);
                } else if (mime === "image/jpeg" || mime === "image/jpg") {
                    imgEmbed = await pdfDoc.embedJpg(arrayBuffer);
                } else {
                    // other types (webp etc) — try to embed as PNG via canvas fallback
                    // convert to PNG via canvas
                    const canvas = document.createElement("canvas");
                    canvas.width = f.width;
                    canvas.height = f.height;
                    const ctx = canvas.getContext("2d");
                    const imgEl = new Image();
                    imgEl.src = f.url;
                    await new Promise((res) => (imgEl.onload = res));
                    ctx.drawImage(imgEl, 0, 0);
                    const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
                    const pngArr = await pngBlob.arrayBuffer();
                    imgEmbed = await pdfDoc.embedPng(pngArr);
                }

                // scale the image to fit A4-like page while preserving aspect ratio
                // We'll create a page sized to the embedded image dimensions in points (1pt = 1/72 inch).
                // Simpler: treat pixel as pt for short use-cases — or scale to fit a standard page size.
                const { width, height } = imgEmbed.scale(1);
                // Let's set page size to image pixel dims scaled down if too large
                const MAX_DIM = 2000; // limit to avoid huge pages
                let pageW = width;
                let pageH = height;
                if (width > MAX_DIM || height > MAX_DIM) {
                    const ratio = width / height;
                    if (width > height) {
                        pageW = MAX_DIM;
                        pageH = Math.round(MAX_DIM / ratio);
                    } else {
                        pageH = MAX_DIM;
                        pageW = Math.round(MAX_DIM * ratio);
                    }
                }

                const page = pdfDoc.addPage([pageW, pageH]);
                // center image on page and draw at page width/height (fit exactly)
                const x = 0;
                const y = 0;
                page.drawImage(imgEmbed, {
                    x,
                    y,
                    width: pageW,
                    height: pageH,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });

            // revoke previous pdfUrl
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setStatus("PDF ready");
            setProcessing(false);
            return blob;
        } catch (err) {
            console.error(err);
            setStatus("Error generating PDF");
            setProcessing(false);
            throw err;
        }

    };

    const handleConvert = async () => {
        setStatus("Generating PDF...");
        setProcessing(true);
        setTimeout(() => {
            generatePdf();
        }, 2000); // simulate delayP
    };

    const handleDownload = async () => {
        try {
            let blob = null;
            if (pdfUrl) {
                // fetch blob from object URL
                const r = await fetch(pdfUrl);
                blob = await r.blob();
            } else {
                blob = await generatePdf();
            }
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `images_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            console.error(e);
            setStatus("Download failed");
        }
    };

    function handlePageSizeChange(size) {
        if (size === "auto") {
            setPageSize("auto");
            return;
        }

        // else show popup
        setShowUnderConstruction(true);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <ToolsNavbar />

            <main className="p-6 ">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    Image → PDF
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                    </svg>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* left: file list & controls */}
                    <section className="col-span-1 bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-gray-200">Upload</div>
                        </div>

                        {/* TOP: Drop area (larger when empty) */}
                        <div
                            className={`relative w-full rounded border-2 transition-all
                            ${files.length === 0 ? "h-45" : "h-30"}
                            ${dragOver ? "border-indigo-500 bg-gray-800/60" : "border-dashed border-gray-700 bg-gray-900"}
                            flex flex-col items-center justify-center`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={() => setDragOver(false)}
                        >
                            <img src={uploading} alt="upload" className="max-h-20 opacity-60" />
                            <div className="text-center text-gray-300">Drop images here or click to upload</div>

                            {/* File input is absolute but confined to this relative parent */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileInput}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                aria-label="Upload images"
                            />
                        </div>

                        {/* MIDDLE: files list (scrollable). When no files show empty spacer (keeps layout) */}
                        <div className="mt-4 flex-1 w-full flex flex-col">
                            <div className="space-y-3 max-h-45 overflow-y-auto custom-scrollbar px-1">
                                {files.length === 0 ? (
                                    // empty placeholder box to keep spacing and show larger drop area above
                                    <div className="h-28 flex items-center justify-center text-sm text-gray-400">No images added</div>
                                ) : (
                                    files.map((f, idx) => (
                                        <div
                                            key={f.url}
                                            ref={(el) => (itemRefs.current[idx] = { current: el })}
                                            draggable
                                            onDragStart={(e) => {
                                                dragIndexRef.current = idx;
                                                e.dataTransfer.effectAllowed = "move";
                                                e.dataTransfer.setData("text/plain", String(idx));
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setDragOverIndex(idx);
                                            }}
                                            onDragEnter={() => setDragOverIndex(idx)}
                                            onDragLeave={() => setDragOverIndex(null)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const from = dragIndexRef.current !== null ? dragIndexRef.current : Number(e.dataTransfer.getData("text/plain"));
                                                const to = idx;
                                                if (from === undefined || from === null) return;
                                                if (from === to) {
                                                    setDragOverIndex(null);
                                                    dragIndexRef.current = null;
                                                    return;
                                                }
                                                setFiles((prev) => {
                                                    const copy = [...prev];
                                                    const [item] = copy.splice(from, 1);
                                                    copy.splice(to, 0, item);
                                                    return copy;
                                                });
                                                setDragOverIndex(null);
                                                dragIndexRef.current = null;
                                            }}
                                            onDragEnd={() => {
                                                setDragOverIndex(null);
                                                dragIndexRef.current = null;
                                            }}
                                            className={`flex items-center gap-3 bg-gray-900 p-2 rounded border border-gray-700 ${dragOverIndex === idx ? "ring-2 ring-indigo-500" : ""} cursor-grab`}
                                        >
                                            <img src={f.url} alt="" className="w-16 h-12 object-contain rounded bg-black flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-gray-200 truncate">{f.name}</div>
                                                <div className="text-xs text-gray-400">{humanFileSize(f.size)}</div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button onClick={() => removeAt(idx)} className="mt-1 px-2 py-1 rounded bg-red-600 text-xs" aria-label={`Remove ${f.name}`}>Remove</button>

                                                <div
                                                    title="Drag to reorder"
                                                    className="ml-2 flex items-center justify-center w-8 h-8 rounded bg-gray-800 hover:bg-gray-700 cursor-grab"
                                                    onMouseDown={() => {
                                                        const el = itemRefs.current[idx]?.current;
                                                        if (el && typeof el.focus === "function") el.focus();
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* BOTTOM: Add + Clear always located here */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-300">{files.length} image(s)</div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    className="px-3 py-2 rounded bg-indigo-600 flex items-center gap-2"
                                    aria-label="Add images"
                                >
                                    Add
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => { setFiles([]); if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null); } }}
                                    className="px-3 py-2 rounded bg-gray-600 flex items-center gap-2 disabled:opacity-50"
                                    aria-label="Clear images"
                                    disabled={files.length === 0}
                                >
                                    Clear
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* middle: convert controls */}
                    <aside className="col-span-1 bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex flex-col justify-between">
                        <div className="mb-2">
                            <label className="block text-sm text-gray-200 font-medium mb-2">Page Size</label>

                            <div className="grid grid-cols-4 gap-2 mt-2">

                                {/* AUTO */}
                                <label
                                    className={`px-3 py-2 rounded cursor-pointer text-sm ${pageSize === "auto"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-800 text-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="pageSize"
                                        value="auto"
                                        className="hidden"
                                        checked={pageSize === "auto"}
                                        onChange={() => handlePageSizeChange("auto")}
                                    />
                                    Auto
                                </label>

                                {/* A4 */}
                                <label
                                    className={`px-3 py-2 rounded cursor-pointer text-sm ${pageSize === "A4"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-800 text-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="pageSize"
                                        value="A4"
                                        className="hidden"
                                        checked={pageSize === "A4"}
                                        onChange={() => handlePageSizeChange("A4")}
                                    />
                                    A4
                                </label>

                                {/* A3 */}
                                <label
                                    className={`px-3 py-2 rounded cursor-pointer text-sm ${pageSize === "A3"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-800 text-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="pageSize"
                                        value="A3"
                                        className="hidden"
                                        checked={pageSize === "A3"}
                                        onChange={() => handlePageSizeChange("A3")}
                                    />
                                    A3
                                </label>

                                {/* Custom */}
                                <label
                                    className={`px-3 py-2 rounded cursor-pointer text-sm ${pageSize === "custom"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-800 text-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="pageSize"
                                        value="custom"
                                        className="hidden"
                                        checked={pageSize === "custom"}
                                        onChange={() => handlePageSizeChange("custom")}
                                    />
                                    Custom
                                </label>
                            </div>

                        </div>

                        <div className="flex items-center justify-center">
                            <img src={BgImg} alt="upload" className="max-h-70" />
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 items-center justify-center w-full">
                            <button
                                onClick={handleConvert}
                                className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={files.length === 0 || processing}
                            >
                                Generate
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>

                            </button>

                            <button
                                onClick={handleDownload} disabled={files.length === 0 || processing}
                                className="px-3 py-2 rounded bg-emerald-500 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                Download
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </button>

                            <button
                                onClick={() => { if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null); } setStatus(""); }}
                                className="px-3 py-2 rounded bg-gray-600 text-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={!pdfUrl}
                            >
                                Clear
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                    </aside>

                    {/* right: preview */}
                    <section className="col-span-1 bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-gray-200">PDF Preview</div>
                            <div className="text-xs text-gray-400">{pdfUrl ? "Ready" : "None"}</div>
                        </div>

                        <div className="w-full h-96 bg-gray-900 rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                            {pdfUrl ? (
                                <iframe title="pdf-preview" src={pdfUrl} className="w-full h-full" />
                            ) : (
                                <div className="text-gray-400 text-sm text-center px-4">
                                    PDF will appear here after generation. Use Download to save the file.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

            </main>

            <ToolsFooter />

            <FullscreenLoader show={processing} message={status || "Generating PDF..."} />

            <UnderConstructionModal
                open={showUnderConstruction}
                onClose={() => {
                    setShowUnderConstruction(false);
                    setPageSize("auto");           // reset page size to Auto when modal closes
                }}
            />

            {alertOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setAlertOpen(false)}
                    />

                    <div className="relative bg-gray-900 text-white p-6 rounded-lg shadow-xl w-80 text-center">
                        <h2 className="text-lg font-semibold mb-3">Alert</h2>
                        <p className="text-sm text-gray-300 mb-5">{alertMessage}</p>

                        <button
                            onClick={() => setAlertOpen(false)}
                            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 w-full"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
}
