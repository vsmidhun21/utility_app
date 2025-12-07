import React, { useState } from "react";
import logo from "../../assets/logo_text.png";
import emailjs from "@emailjs/browser";
import LoadingOverlay from "../loading/Loading";
import { useNavigate } from "react-router-dom";

export default function ContactSupport() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const [status, setStatus] = useState(false);

    const emailService = import.meta.env.Email_Service;
    const emailTemplate = import.meta.env.Email_Template;
    const secretKey = import.meta.env.Email_Secrect;

    const handleSubmit = (e) => {
        e.preventDefault();

        // show loader immediately
        setStatus(true);

        // track if API is done
        let emailFinished = false;
        let timerFinished = false;

        // 3-second minimum timer
        setTimeout(() => {
            timerFinished = true;
            if (emailFinished) {
                setStatus(false);
            }
        }, 5000);

        emailjs
            .send(
                emailService,
                emailTemplate,
                {
                    from_name: form.name,
                    from_email: form.email,
                    message: form.message,
                },
                secretKey
            )
            .then(
                () => {
                    emailFinished = true;

                    // only hide if timer also finished
                    if (timerFinished) {
                        setStatus(false);
                    }

                    setForm({ name: "", email: "", message: "" });
                },
                () => {
                    emailFinished = true;

                    if (timerFinished) {
                        setStatus(false);
                    }
                }
            );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
            <div className="max-w-2xl w-full text-center mb-5">
                <img
                    src={logo}
                    alt="Support illustration"
                    className="mx-auto mb-6 w-48 h-auto opacity-90"
                    onClick={() => navigate("/")}
                />

                <h1 className="text-3xl sm:text-4xl font-bold mb-3">Contact Support</h1>

                <p className="text-gray-300 text-base sm:text-lg">
                    Having an issue or need help?
                    Feel free to reach out.
                </p>
            </div>

            {/* Contact Form */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg"
            >
                <div className="mb-4 text-left">
                    <label className="block text-sm mb-1 text-gray-300">Your Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter your name"
                    />
                </div>

                <div className="mb-4 text-left">
                    <label className="block text-sm mb-1 text-gray-300">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter your email"
                    />
                </div>

                <div className="mb-6 text-left">
                    <label className="block text-sm mb-1 text-gray-300">Message</label>
                    <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full p-3 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Describe your issue or question…"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-md font-semibold text-white shadow-md transition"
                >
                    Send Message
                </button>
            </form>

            <LoadingOverlay show={status} />

            {/* Quick Contact */}
            <div className="mt-3 text-center text-gray-300 text-sm">
                <p>
                    Or email directly:{" "}
                    <a
                        href="mailto:midhun890390@gmail.com"
                        className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                        midhun890390@gmail.com
                    </a>
                </p>
            </div>
        </div>
    );
}
