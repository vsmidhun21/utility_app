import React, { useState } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from './components/home/Landing';
import ImageTool from './components/tools/ImageTool';
import NotFound from './components/not_found/NotFound';
import ContactSupport from './components/contact/Contact';
import ImageCompress from './components/tools/ImageCompress';
import ImageConverter from './components/tools/ImageConverter';
import ImageToPdf from './components/tools/ImageToPdf';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <Routes>

      {/* Landing page at root */}
      <Route path="/" element={<Landing onStart={() => {setStarted(true);}} />}/>

      {/* Tools page */}
      <Route path="/tools" element={<ImageTool />} />

      {/* If started was toggled somewhere else, redirect /start to /tools */}
      <Route path="/start" element={started ? <Navigate to="/tools" replace /> : <Navigate to="/" replace />} />

      {/* Contact Support page */}
      <Route path="/contact" element={<ContactSupport />} />

      {/* Image Compression tool */}
      <Route path="/tools/image-compress" element={<ImageCompress />} />

      {/* Image Conversion tool */}
      <Route path="/tools/image-convert" element={<ImageConverter />} />

      {/* Image to PDF tool */}
      <Route path="/tools/image-to-pdf" element={<ImageToPdf />} />

      {/* fallback: unknown paths -> landing */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}