import React, { useEffect, useState, useRef } from 'react'
import uploadimg from '../../../public/upload_image.png'
import ToolsNavbar from '../navbar/Navbar'
import Footer from '../footer/Footer'
import Uploading from '../loading/Uploading';

export default function ImageCompressor() {
    const [file, setFile] = useState(null)
    const [originalUrl, setOriginalUrl] = useState(null)
    const [compressedUrl, setCompressedUrl] = useState(null)
    const [originalSize, setOriginalSize] = useState(0)
    const [compressedSize, setCompressedSize] = useState(0)
    const [quality, setQuality] = useState(75)
    const [maxWidth, setMaxWidth] = useState(1024)
    const [status, setStatus] = useState('')
    const uploadInputRef = useRef(null)

    useEffect(() => {
        // regenerate compressed preview when file/quality/maxWidth changes
        if (file) generateCompressedPreview(file, quality, maxWidth)
        // cleanup on unmount
        return () => {
            if (originalUrl) URL.revokeObjectURL(originalUrl)
            if (compressedUrl) URL.revokeObjectURL(compressedUrl)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quality, maxWidth, file])

    const humanFileSize = (bytes) => {
        if (!bytes) return '0 B'
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        const sizes = ['B', 'KB', 'MB', 'GB']
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
    }

    const onFilePicked = (f) => {
        if (!f) return
        if (originalUrl) URL.revokeObjectURL(originalUrl)
        if (compressedUrl) URL.revokeObjectURL(compressedUrl)
        setFile(f)
        setOriginalUrl(URL.createObjectURL(f))
        setOriginalSize(f.size)
        setStatus('Preparing preview...')
    }

    const [uploading, setUploading] = useState(false);
    const handleFileInput = (e) => {
        setUploading(true);
        setTimeout(() => {
            const f = e.target.files[0];
            onFilePicked(f);
        }, 2000); // simulate delay
    };

    const handleDrop = (e) => {
        e.preventDefault()
        const f = e.dataTransfer.files?.[0]
        onFilePicked(f)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    async function generateCompressedPreview(fileObj, q, maxW) {
        setStatus('Compressing preview...')
        const img = new Image()
        img.src = URL.createObjectURL(fileObj)

        await new Promise((resolve, reject) => {
            img.onload = () => resolve(true)
            img.onerror = (e) => reject(e)
        })

        const ratio = img.width / img.height
        let targetW = img.width
        let targetH = img.height
        if (maxW && img.width > maxW) {
            targetW = maxW
            targetH = Math.round(maxW / ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, targetW, targetH)

        const mime = 'image/jpeg'
        const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, mime, Math.max(0.01, q / 100))
        )

        if (!blob) throw new Error('Compression failed')

        if (compressedUrl) URL.revokeObjectURL(compressedUrl)
        const cUrl = URL.createObjectURL(blob)
        setCompressedUrl(cUrl)
        setCompressedSize(blob.size)
        setStatus('Preview ready')
        setUploading(false);

        return blob
    }

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    const handleDownloadCompressed = async () => {
        if (!file) return alert('Choose a file first')
        setStatus('Preparing download...')
        try {
            const blob = await generateCompressedPreview(file, quality, maxWidth)
            const name = file.name.replace(/\.[^/.]+$/, '') + '.jpg'
            downloadBlob(blob, `compressed_${name}`)
            setStatus('Downloaded')
        } catch (e) {
            console.error(e)
            setStatus('Download failed')
        }
    }

    return (
        <>
            <div className="min-h-screen bg-gray-900 text-white">
                <ToolsNavbar />

                <main className="p-6 ">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                        Image Compressor
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                        </svg>

                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Original Card */}
                        <section className="col-span-1 bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex flex-col items-center justify-start" onDrop={handleDrop} onDragOver={handleDragOver}>
                            <div className="w-full flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                    Original
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                </div>
                                <div className="text-xs text-gray-400">{humanFileSize(originalSize)}</div>
                            </div>

                            <div className="w-full h-64 bg-gray-900 border border-dashed border-gray-700 rounded flex items-center justify-center overflow-hidden relative">
                                {originalUrl ? (
                                    <>
                                        <img
                                            src={originalUrl}
                                            alt="original"
                                            style={{
                                                maxHeight: '100%',
                                                maxWidth: '100%',
                                                objectFit: 'contain',
                                            }}
                                            className="block"
                                        />

                                        <input
                                            ref={uploadInputRef}
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

                                        {/* hidden input covers area so clicking opens file picker as before */}
                                        <input
                                            ref={uploadInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileInput}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            title="Drop or click to upload"
                                        />
                                    </>
                                )}
                            </div>

                            {/* Upload button below dropbox */}
                            <div className="w-full mt-3 flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
                                    className="px-4 py-2 rounded flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 transition"
                                >
                                    Upload
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                    </svg>

                                </button>
                            </div>
                        </section>

                        {/* Controls (middle column) */}
                        <aside className="col-span-1 space-y-4 bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                    Controls
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                                    </svg>

                                </span>
                            </label>

                            <div>
                                <label className="text-sm font-medium text-gray-200">Quality: {quality}%</label>
                                <input
                                    type="range"
                                    min={10}
                                    max={95}
                                    value={quality}
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full mt-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-200">Max width (px)</label>
                                <input
                                    type="number"
                                    min={100}
                                    value={maxWidth}
                                    onChange={(e) => setMaxWidth(Number(e.target.value))}
                                    className="w-full mt-2 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 w-full gap-y-3 mt-4">

                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={handleDownloadCompressed}
                                        className="px-3 py-2 flex items-center gap-2 rounded bg-emerald-500 text-white disabled:opacity-50"
                                        disabled={!file}
                                    >
                                        Download
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => file && generateCompressedPreview(file, quality, maxWidth)}
                                        className="flex items-center gap-2 px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
                                        disabled={!file}
                                    >
                                        Update Preview
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex flex-col items-start gap-2">
                                    <button
                                        onClick={() => {
                                            setFile(null)
                                            if (originalUrl) URL.revokeObjectURL(originalUrl)
                                            if (compressedUrl) URL.revokeObjectURL(compressedUrl)
                                            setOriginalUrl(null)
                                            setCompressedUrl(null)
                                            setOriginalSize(0)
                                            setCompressedSize(0)
                                            setStatus('Cleared')
                                        }}
                                        className="px-3 py-2 flex items-center gap-2 rounded bg-gray-600 text-gray-200 disabled:opacity-50"
                                        disabled={!file}
                                    >
                                        Clear
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>

                                    </button>

                                    <button
                                        onClick={() => file && generateCompressedPreview(file, quality, maxWidth)}
                                        className="px-3 py-2 flex items-center gap-2 rounded bg-indigo-600 text-white disabled:opacity-50"
                                        disabled={!file}
                                    >
                                        Re Compress
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>

                                    </button>
                                </div>

                            </div>

                            <div className="mt-2 text-sm text-gray-300 w-full">

                                <div className="flex items-center justify-between w-full">
                                    <div>Original size: <strong>{humanFileSize(originalSize)}</strong></div>
                                    <div>Compressed size: <strong>{humanFileSize(compressedSize)}</strong></div>
                                </div>

                                <div className="text-xs text-gray-400 text-center mt-2">
                                    {status}
                                </div>

                            </div>

                        </aside>

                        {/* Compressed Card */}
                        <section className="col-span-1 bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex flex-col">
                            <div className="w-full flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                    Compressed
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                    </svg>
                                </div>
                                <div className="text-xs text-gray-400">{humanFileSize(compressedSize)}</div>
                            </div>

                            <div className="w-full h-64 bg-gray-900 rounded border border-gray-700 flex items-center justify-center overflow-hidden">
                                {compressedUrl ? (
                                    <img
                                        src={compressedUrl}
                                        alt="compressed"
                                        style={{
                                            maxHeight: '100%',
                                            maxWidth: '100%',
                                            objectFit: 'contain'
                                        }}
                                        className="block"
                                    />
                                ) : (
                                    <div className="text-gray-400 text-sm">Compressed preview will appear here after upload.</div>
                                )}
                            </div>

                            <div className="mt-3 flex items-center justify-center gap-2">
                                <button
                                    onClick={handleDownloadCompressed}
                                    className="px-3 py-2 flex items-center gap-2 rounded bg-emerald-500 text-white disabled:opacity-50"
                                    disabled={!compressedUrl}
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

                <Uploading show={uploading} message="Uploading and compressing..." />

                <div className="mt-20"></div>
                <Footer />
            </div>
        </>
    )
}
