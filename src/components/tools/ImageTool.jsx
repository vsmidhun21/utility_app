import React, { useState } from 'react'
import { compressImage, convertImage, imageToPdf } from '../../api'
import ToolsNavbar from '../navbar/Navbar'


export default function ImageTool() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [quality, setQuality] = useState(75)
    const [maxWidth, setMaxWidth] = useState(1024)
    const [status, setStatus] = useState('')


    const handleFile = (e) => {
        const f = e.target.files[0]
        if (!f) return
        setFile(f)
        setPreview(URL.createObjectURL(f))
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


    const handleCompress = async () => {
        if (!file) return alert('Choose a file first')
        setStatus('Compressing...')
        try {
            const blob = await compressImage(file, quality, maxWidth)
            downloadBlob(blob, `compressed_${file.name.replace(/\.[^/.]+$/, '.jpg')}`)
            setStatus('Done!')
        } catch (err) {
            console.error(err)
            setStatus('Error during compression')
        }
    }

    const handleConvert = async (format) => {
        if (!file) return alert('Choose a file first')
        setStatus('Converting...')
        try {
            const blob = await convertImage(file, format)
            const ext = format.toLowerCase()
            downloadBlob(blob, `converted_${file.name.split('.')[0]}.${ext}`)
            setStatus('Done!')
        } catch (e) {
            console.error(e)
            setStatus('Convert failed')
        }
    }


    const handleToPdf = async () => {
        if (!file) return alert('Choose a file first')
        setStatus('Generating PDF...')
        try {
            const blob = await imageToPdf(file)
            downloadBlob(blob, `${file.name.split('.')[0]}.pdf`)
            setStatus('Done!')
        } catch (e) {
            console.error(e)
            setStatus('PDF failed')
        }
    }

    return (
        <>
            <ToolsNavbar />
            <div className="p-6 min-h-screen bg-gray-900 text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="block">
                            <span className="sr-only">Choose image</span>
                            <input type="file" accept="image/*" onChange={handleFile} />
                        </label>


                        <div className="flex items-center gap-2">
                            <label>Quality: {quality}</label>
                            <input type="range" min="10" max="95" value={quality} onChange={e => setQuality(Number(e.target.value))} />
                        </div>


                        <div className="flex items-center gap-2">
                            <label>Max width (px):</label>
                            <input type="number" value={maxWidth} onChange={e => setMaxWidth(Number(e.target.value))} />
                        </div>


                        <div className="flex gap-3">
                            <button onClick={handleCompress} className="px-4 py-2 rounded bg-indigo-600 text-white">Compress</button>
                            <button onClick={() => handleConvert('PNG')} className="px-4 py-2 rounded bg-slate-200">Convert → PNG</button>
                            <button onClick={() => handleConvert('JPEG')} className="px-4 py-2 rounded bg-slate-200">Convert → JPEG</button>
                            <button onClick={handleToPdf} className="px-4 py-2 rounded bg-emerald-500 text-white">Image → PDF</button>
                        </div>


                        <div className="text-sm text-slate-500">{status}</div>
                    </div>


                    <div className="border rounded p-4 flex items-center justify-center">
                        {preview ? (
                            <img src={preview} alt="preview" className="max-w-full max-h-80 object-contain" />
                        ) : (
                            <div className="text-slate-400">No image selected</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}