import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, FileText, Pin, BrainCircuit, Briefcase, Users, LayoutDashboard, Building2, Calendar, Bell } from 'lucide-react';
import logo from '../utils/logo.png';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white font-sans text-black overflow-x-hidden">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full bg-[#FFF6D9] border-b-[3px] border-black px-4 md:px-8">
                <div className="flex justify-between items-center max-w-7xl mx-auto w-full py-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <img src={logo} alt="PlacementPro Logo" className="w-8 h-8 object-contain" />
                        PlacementPro
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
                        <a href="#companies" className="hover:opacity-70 transition-opacity">Companies</a>
                        <a href="#drives" className="hover:opacity-70 transition-opacity">Drives</a>
                        <Link to="/tpo/dashboard" className="hover:opacity-70 transition-opacity">Dashboard</Link>
                        <Link to="/login" className="hover:opacity-70 transition-opacity">Login</Link>
                    </div>

                    {/* CTA Button */}
                    <div>
                        <Link to="/register" className="bg-black text-white px-6 py-2.5 text-sm font-bold shadow-[4px_4px_0px_0px_#000000] border-2 border-black hover:bg-gray-800 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-wider">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* TPO Registration Notice Banner */}
            <div className="w-full bg-black text-white border-b-[3px] border-black px-4 py-3 flex items-center justify-center gap-3 text-center">
                <span className="text-[#FFCC00] text-base flex-shrink-0" aria-hidden="true">⚠️</span>
                <p className="text-xs sm:text-sm font-bold tracking-wide uppercase">
                    TPO / Placement Officer registration is currently disabled.&nbsp;
                    <span className="text-[#FFCC00]">
                        To get access, please contact the administrator directly.
                    </span>
                </p>
            </div>

            {/* SECTION 1: HERO */}
            <div className="bg-[#FFCC00] w-full min-h-[calc(100vh-80px)] flex flex-col pt-12 px-8 pb-16 relative overflow-hidden">
                {/* Hero Content */}
                <main className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl mx-auto mt-8 md:mt-16 w-full relative z-10">
                    <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="border-2 border-black bg-white px-3 py-1 rounded text-xs font-bold tracking-wider mb-8 uppercase">
                            version 2.0 - Now with AI-powered analytics!
                        </div>

                        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-none mb-6">
                            Track. Prepare.<br />Get Placed.
                        </h1>

                        <p className="text-lg md:text-xl font-medium mb-10 max-w-2xl px-4 lg:px-0">
                            Your intelligent placement management system designed to empower colleges and streamline student careers.
                        </p>

                        {/* Search Bar */}
                        <div className="flex w-full max-w-2xl lg:max-w-xl bg-white border-4 border-black p-1 rounded-sm shadow-[4px_4px_0px_0px_#000000] mb-12">
                            <div className="flex items-center px-4 text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search for jobs, companies or drives..."
                                className="flex-1 outline-none text-black placeholder-gray-500 bg-transparent font-medium"
                            />
                            <button className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors">
                                Search
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Link to="/register" className="bg-black text-white px-8 py-4 font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_#000] border-2 border-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                                Explore Drives <span>→</span>
                            </Link>
                            <button className="bg-white px-8 py-4 font-bold border-2 border-black flex items-center justify-center hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                                Request Demo
                            </button>
                        </div>
                    </div>

                    {/* Big Logo on Side */}
                    <div className="hidden lg:flex flex-1 justify-center items-center relative">
                        {/* Decorative background for logo */}
                        <div className="absolute w-72 h-72 md:w-[400px] md:h-[400px] bg-white rounded border-[4px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"></div>
                        <img src={logo} alt="PlacementPro Hero Logo" className="w-64 h-64 md:w-[320px] md:h-[320px] object-contain relative z-10 hover:-translate-y-2 transition-transform duration-300" />
                    </div>
                </main>
            </div>

            {/* CORE FEATURES SECTION */}
            <div className="py-24 bg-white border-b-[3px] border-black border-t-[3px] mt-[-3px]">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4 uppercase">Core Features</h2>
                        <p className="text-xl font-bold text-black max-w-2xl mx-auto border-[3px] border-black p-3 bg-[#FFF6D9] shadow-[4px_4px_0px_0px_#000]">
                            Everything you need to master your placement journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Pulse */}
                        <div className="border-[3px] border-black p-8 bg-white shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-[#FFCC00] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
                                <Globe size={28} strokeWidth={3} className="text-black" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">Pulse</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Real-time placement updates and announcements in one centralized stream.
                            </p>
                        </div>

                        {/* Resume */}
                        <div className="border-[3px] border-black p-8 bg-[#FFF6D9] shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-black border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#FFCC00]">
                                <FileText size={28} strokeWidth={3} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">Resume</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Manage and optimize your resume tailored for campus placements.
                            </p>
                        </div>

                        {/* Drive Tracker */}
                        <div className="border-[3px] border-black p-8 bg-white shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-[#FFCC00] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
                                <Pin size={28} strokeWidth={3} className="text-black" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">Drive Tracker</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Track company applications, interview rounds, and placement progress.
                            </p>
                        </div>

                        {/* AI Skill Analyzer */}
                        <div className="border-[3px] border-black p-8 bg-[#FFF6D9] shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-black border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#FFCC00]">
                                <BrainCircuit size={28} strokeWidth={3} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">AI Skill Analyzer</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Analyze your skills against real-time job market demands and identify actionable gaps.
                            </p>
                        </div>

                        {/* Opportunities */}
                        <div className="border-[3px] border-black p-8 bg-white shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-[#FFCC00] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
                                <Briefcase size={28} strokeWidth={3} className="text-black" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">Opportunities</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Explore curated placement drives and company openings.
                            </p>
                        </div>

                        {/* MentorHub */}
                        <div className="border-[3px] border-black p-8 bg-[#FFF6D9] shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-black border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#FFCC00]">
                                <Users size={28} strokeWidth={3} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">MentorHub</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Connect with mentors and alumni for career guidance.
                            </p>
                        </div>

                        {/* Placement Dashboard */}
                        <div className="border-[3px] border-black p-8 bg-white shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-[#FFCC00] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
                                <LayoutDashboard size={28} strokeWidth={3} className="text-black" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">Placement Dashboard</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Get a bird's-eye view of all placement activities and student metrics.
                            </p>
                        </div>

                        {/* Drive Management */}
                        <div className="border-[3px] border-black p-8 bg-[#FFF6D9] shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-black border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#FFCC00]">
                                <Building2 size={28} strokeWidth={3} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">Drive Management</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Create, schedule, and seamlessly manage placement drives with corporate partners.
                            </p>
                        </div>

                        {/* Interview Scheduler */}
                        <div className="border-[3px] border-black p-8 bg-white shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-[#FFCC00] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
                                <Calendar size={28} strokeWidth={3} className="text-black" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">Interview Scheduler</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Effortlessly coordinate interview slots between recruiters and students.
                            </p>
                        </div>

                        {/* Smart Notifications */}
                        <div className="border-[3px] border-black p-8 bg-[#FFF6D9] shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col">
                            <div className="w-14 h-14 bg-black border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#FFCC00]">
                                <Bell size={28} strokeWidth={3} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-wider mb-3">Smart Notifications</h3>
                            <p className="font-medium text-black leading-relaxed">
                                Send automated alerts and updates across email, SMS, and in-app channels.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: TRUSTED BY */}
            <div className="py-12 border-b-2 border-black">
                <p className="text-center text-xs font-bold tracking-widest text-gray-400 mb-8 uppercase">Trusted by world class organizations</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 max-w-5xl mx-auto px-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-8 w-24 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>

            {/* SECTION 3: DASHBOARD PREVIEW */}
            <div className="py-24 bg-[#FAFAFA]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] p-4 md:p-8 flex flex-col md:flex-row gap-6">

                        {/* Left Col (Analytics) */}
                        <div className="flex-1 border-2 border-gray-100 p-6 flex flex-col">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#FFCC00] flex items-center justify-center font-bold border-2 border-black">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold whitespace-nowrap">Analytics Dashboard</h3>
                                        <p className="text-xs text-gray-500 font-medium">AI-Powered Insights</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-gray-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></button>
                                    <button className="w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-gray-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                                </div>
                            </div>

                            {/* Analytics Box */}
                            <div className="flex-1 min-h-[200px] border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50/50">
                                <p className="font-bold text-sm tracking-wider uppercase text-gray-500">Will be available in version 2.0</p>
                            </div>
                        </div>

                        {/* Right Col (Stats) */}
                        <div className="w-full md:w-80 flex flex-col gap-6">
                            <div className="bg-black text-white p-6 h-1/2 flex flex-col justify-center">
                                <svg className="w-6 h-6 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <div className="text-4xl font-extrabold mb-1">X</div>
                                <div className="text-xs font-bold tracking-widest text-[#FFCC00] uppercase">Active Applications</div>
                            </div>

                            <div className="bg-[#E53955] text-white p-6 h-1/2 flex flex-col justify-center border-2 border-[#bc223a]">
                                <svg className="w-6 h-6 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                <div className="font-bold text-lg mb-1 leading-tight">Mentor Session</div>
                                <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Tomorrow • 10:00 AM</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* SECTION 4: STREAMLINE */}
            <div id="features" className="py-24 max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <h2 className="text-5xl md:text-7xl font-black max-w-2xl leading-[1.1] tracking-tight">
                        Streamline Your<br />Placement<br />Process
                    </h2>
                    <p className="max-w-md text-gray-600 font-medium md:text-right text-lg">
                        Everything you need to manage thousands of students and hundreds of corporate partners from a single interface.
                    </p>
                </div>

                <div className="bg-[#FFCC00] border-[3px] border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_#000]">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <h3 className="text-3xl md:text-5xl font-black mb-6 leading-[1.2] uppercase tracking-tight">
                                Empowering institutions to achieve higher placement rates.
                            </h3>
                            <p className="text-xl font-bold border-l-8 border-black pl-6 py-2 bg-white/50 backdrop-blur-sm shadow-[4px_4px_0px_0px_#000] border-r-2 border-y-2 p-4">
                                A comprehensive platform centralizing all operations for colleges, recruiters, and students. By simplifying the recruitment journey, we help seamlessly connect students with their dream careers.
                            </p>
                        </div>
                        <div className="hidden lg:block w-48 h-48 border-[3px] border-black bg-white shadow-[8px_8px_0px_0px_#000] flex-shrink-0 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] opacity-20"></div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-all">
                                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-[#FFCC00] font-black text-4xl shadow-[4px_4px_0px_0px_#FFF] border-[3px] border-white group-hover:scale-110 transition-transform">
                                    100%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 5: HOW IT WORKS */}
            <div className="bg-[#E53955] py-24 border-y border-black">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h2 className="text-5xl md:text-6xl font-black text-white text-center mb-16">
                        How It Works
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3">
                        {/* Step 1 */}
                        <div className="bg-black text-white p-8 md:p-12 border border-[#E53955]/20 md:border-r-white/20 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#E53955] mb-8 rotate-[-5deg] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 tracking-widest uppercase">1. Colleges Add Drives</h3>
                            <p className="text-gray-400 font-medium text-sm">
                                Post job descriptions, eligibility criteria, and assessment schedules in minutes.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-black text-white p-8 md:p-12 border border-[#E53955]/20 md:border-r-white/20 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#FFCC00] mb-8 rotate-[5deg] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 tracking-widest uppercase text-[#FFCC00]">2. Students Apply</h3>
                            <p className="text-gray-400 font-medium text-sm">
                                One-click applications for eligible students with automated profile verification.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-black text-white p-8 md:p-12 border border-[#E53955]/20 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white mb-8 rotate-[-5deg] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,204,0,1)]">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 tracking-widest uppercase">3. Track Progress</h3>
                            <p className="text-gray-400 font-medium text-sm">
                                Real-time status updates, scheduling, and outcome management for all parties.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 6: CTA */}
            <div className="py-24 md:py-32 bg-white px-4">
                <div className="max-w-4xl mx-auto border-[3px] border-black p-8 md:p-16 text-center shadow-[8px_8px_0px_0px_#000000] bg-white relative top-0 left-0">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Ready to simplify placements?
                    </h2>
                    <p className="text-lg md:text-xl font-medium text-gray-600 mb-10 max-w-2xl mx-auto">
                        Aim is to provide a comprehensive platform that simplifies the placement process for colleges, recruiters, and students alike. By centralizing all placement-related activities, we help institutions manage their placement drives more efficiently, while providing students with a seamless experience to explore opportunities and track their applications. Our goal is to empower educational institutions to achieve higher placement rates and better connect students with their dream careers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-black text-white px-8 py-4 font-bold border-2 border-black hover:bg-gray-800 transition-colors">
                            Start Free Trial
                        </Link>
                        <button className="bg-white px-8 py-4 font-bold border-2 border-black hover:bg-gray-50 transition-colors">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="border-t border-gray-200 py-16 px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
                    {/* Footer Logo & Desc */}
                    <div className="max-w-xs">
                        <div className="flex items-center gap-2 font-black text-xl mb-4">
                            <img src={logo} alt="PlacementPro Logo" className="w-8 h-8 object-contain" />
                            PlacementPro
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                            Leading the future of campus recruitment with intelligent tools for institutions, recruiters, and candidates.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex gap-16 md:gap-24">
                        <div>
                            <h4 className="font-bold text-xs tracking-widest text-gray-400 uppercase mb-6">Product</h4>
                            <ul className="flex flex-col gap-4 text-sm font-medium text-gray-600">
                                <li><a href="#" className="hover:text-black">Features</a></li>

                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs tracking-widest text-gray-400 uppercase mb-6">Company</h4>
                            <ul className="flex flex-col gap-4 text-sm font-medium text-gray-600">
                                <li><a href="#" className="hover:text-black">About Developer</a></li>

                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs tracking-widest text-gray-400 uppercase mb-6">Support</h4>
                            <ul className="flex flex-col gap-4 text-sm font-medium text-gray-600">

                            </ul>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-400">
                    <p>© 2026 PlacementPro. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-black"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></a>
                        <a href="#" className="hover:text-black"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx={4} cy={4} r={2} /></svg></a>
                        <a href="#" className="hover:text-black"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg></a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
