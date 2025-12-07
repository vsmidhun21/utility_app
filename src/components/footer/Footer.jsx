import React from "react";
import { SiGithub, SiInstagram, SiYoutube, SiGooglechrome, SiLinkedin, SiGmail } from "react-icons/si";

export default function Footer() {
    return (
        <footer className="border-t border-white/20 mt-3 py-8 text-center ">
            <p className="text-sm text-gray-300 mb-3">
                Developed by <span className="font-semibold text-white">Midhun</span>
            </p>

            {/* Social Icons */}
            <div className="flex items-center justify-center gap-6">
                {/* GitHub */}
                <a
                    href="https://github.com/vsmidhun21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition"
                    aria-label="GitHub"
                >
                    <SiGithub className="h-6 w-6 text-gray-300" />
                </a>

                {/* Instagram */}
                <a
                    href="https://instagram.com/midhun_v_s_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition"
                    aria-label="Instagram"
                >
                    <SiInstagram className="h-6 w-6 text-gray-300" />
                </a>

                {/* YouTube */}
                <a
                    href="https://www.youtube.com/@Unlucky_Coder21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition"
                    aria-label="YouTube"
                >
                    <SiYoutube className="h-6 w-6 text-gray-300" />
                </a>

                {/* Website */}
                <a
                    href="https://vsmidhun21.github.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition"
                    aria-label="Website"
                >
                    <SiGooglechrome className="h-6 w-6 text-gray-300" />
                </a>

                {/* Linkedin */}
                <a
                    href="https://www.linkedin.com/in/midhun-v-s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition"
                    aria-label="Website"
                >
                    <SiLinkedin className="h-6 w-6 text-gray-300" />
                </a>

                {/* Mail */}
                <a
                    href="mailto:midhun890390@gail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition"
                    aria-label="Website"
                >
                    <SiGmail className="h-6 w-6 text-gray-300" />
                </a>
            </div>
        </footer>
    );
}
