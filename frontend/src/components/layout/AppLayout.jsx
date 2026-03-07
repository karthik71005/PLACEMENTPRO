import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppLayout({ children, pageTitle = "" }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* ── Desktop Sidebar ──────────────────────────────────── */}
            <div className="hidden md:flex">
                <Sidebar collapsed={sidebarCollapsed} />
            </div>

            {/* ── Mobile Sidebar Overlay ───────────────────────────── */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                    <div className="absolute left-0 top-0 bottom-0 z-50">
                        <Sidebar collapsed={false} />
                    </div>
                </div>
            )}

            {/* ── Main Area ────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar
                    title={pageTitle}
                    onMenuToggle={() => setMobileSidebarOpen((p) => !p)}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

            {/* ── Desktop Sidebar Collapse Toggle ──────────────────── */}
            <button
                onClick={() => setSidebarCollapsed((p) => !p)}
                className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-5 h-10 bg-white border border-gray-200 rounded-r-full shadow-sm text-gray-400 hover:text-gray-700 transition-colors"
                style={{ left: sidebarCollapsed ? "4rem" : "15rem" }}
                aria-label="Toggle sidebar"
            >
                {sidebarCollapsed ? "›" : "‹"}
            </button>
        </div>
    );
}
