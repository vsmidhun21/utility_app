import axios from 'axios'

// For Production
const API_BASE = 'https://midhunvs.pythonanywhere.com'

// for local development
// const API_BASE = 'http://127.0.0.1:5000'


export async function compressImage(file, quality = 75, max_width = null) {
    const form = new FormData()
    form.append('file', file)
    form.append('quality', quality)
    if (max_width) form.append('max_width', max_width)


    const res = await axios.post(`${API_BASE}/compress`, form, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
}


export async function convertImage(file, format) {
    const form = new FormData();
    form.append('file', file);
    form.append('format', format);
    const res = await axios.post(`${API_BASE}/convert`, form, { responseType: 'blob' })
    return res.data
}


export async function imageToPdf(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await axios.post(`${API_BASE}/to-pdf`, form, { responseType: 'blob' })
    return res.data
}