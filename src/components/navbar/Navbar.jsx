import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

export default function ToolsNavbar() {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toolsList = [
        { name: "Image Compressor", path: "/tools/image-compress" },
        { name: "Image Converter", path: "/tools/image-convert" },
        { name: "Image to PDF", path: "/tools/image-to-pdf" },
        { name: "Video Compressor", path: "/tools/video-compress" },
        { name: "PDF Tools", path: "/tools/pdf-tools" },
    ];

    const handleToolClick = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    // put near the top of the component
    const hoverTimeoutRef = React.useRef(null);

    const openDropdown = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setDropdownOpen(true);
    };

    const closeDropdownWithDelay = (delay = 180) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setDropdownOpen(false);
            hoverTimeoutRef.current = null;
        }, delay);
    };


    return (
        <nav className="w-full bg-gray-900 border-b border-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

                {/* Branding */}
                <div className="text-xl font-semibold text-indigo-400 tracking-wide cursor-pointer"
                    onClick={() => navigate("/")}>
                    Flexify Zest
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-gray-300">

                    <label onClick={() => navigate("/")} className="hover:text-white transition cursor-pointer">
                        Home
                    </label>

                    {/* Tools Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={openDropdown}
                        onMouseLeave={() => closeDropdownWithDelay(180)}
                        onFocus={openDropdown}
                        onBlur={() => closeDropdownWithDelay(180)}
                    >
                        <label
                            tabIndex={0}
                            className="flex items-center gap-1 hover:text-white transition cursor-pointer"
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            Tools <ChevronDownIcon className="w-4 h-4" />
                        </label>

                        {dropdownOpen && (
                            <div
                                className="absolute left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-xl z-50 p-2"
                                onMouseEnter={openDropdown}           
                                onMouseLeave={() => closeDropdownWithDelay(180)}
                            >
                                {toolsList.map((tool, idx) => (
                                    <div
                                        key={idx}
                                        className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded cursor-pointer"
                                        onClick={() => handleToolClick(tool.path)}
                                        role="menuitem"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToolClick(tool.path) }}
                                    >
                                        {tool.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <label onClick={() => navigate("/features")} className="hover:text-white transition cursor-pointer">Features</label>
                    <label onClick={() => navigate("/contact")} className="hover:text-white transition cursor-pointer">Contact</label>
                </div>

                {/* Mobile Menu Icon */}
                <button
                    className="md:hidden text-gray-300"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="md:hidden bg-gray-850 px-5 pb-5 border-t border-gray-800">

                    <label onClick={() => { navigate("/"); setMobileOpen(false); }} className="block w-full text-left text-gray-300 py-3 border-b border-gray-800">
                        Home
                    </label>

                    <div className="py-2 border-b border-gray-800">
                        <label
                            className="w-full flex items-center justify-between text-gray-300 py-3"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            Tools
                            <ChevronDownIcon
                                className={`w-5 h-5 transition ${dropdownOpen ? "rotate-180" : ""}`}
                            />
                        </label>

                        {dropdownOpen && (
                            <div className="pl-3 space-y-1">
                                {toolsList.map((tool, idx) => (
                                    <div
                                        key={idx}
                                        className="px-3 py-2 text-gray-300 hover:bg-gray-700 rounded cursor-pointer"
                                        onClick={() => handleToolClick(tool.path)}
                                    >
                                        {tool.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <label onClick={() => navigate('/feature')} className="block w-full text-left text-gray-300 py-3 border-b border-gray-800">Features</label>
                    <label onClick={() => navigate('/contact')} className="block w-full text-left text-gray-300 py-3">Contact</label>
                </div>
            )}
        </nav>
    );
}
