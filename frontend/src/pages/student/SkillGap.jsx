import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertTriangle, Lightbulb, BookOpen, Search, ArrowRight } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import api from "../../services/api";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import { pdf } from "@react-pdf/renderer";
import { SkillGapPDF } from "../../utils/pdf/SkillGapPDF";
import toast from "react-hot-toast";
// Common roles for the search suggestions
const COMMON_ROLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Engineer",
    "Data Analyst",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer",
    "UI/UX Designer",
];

export default function SkillGap() {
    const [searchTerm, setSearchTerm] = useState("");
    const [targetRole, setTargetRole] = useState("Software Engineer");

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["skill-gap", targetRole],
        queryFn: async () => {
            const res = await api.get(`/api/ai/skill-gap?target_role=${encodeURIComponent(targetRole)}`);
            return res.data;
        },
        // Don't auto-fetch if TargetRole is empty, but here it defaults
        enabled: !!targetRole,
        retry: 1, // Only retry once for AI calls
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setTargetRole(searchTerm.trim());
        }
    };

    const handleSuggestionClick = (role) => {
        setSearchTerm(role);
        setTargetRole(role);
    };

    const handleExportPlan = async () => {
        if (!data) return;

        try {
            toast.loading("Generating PDF...", { id: "skillgap-pdf" });

            const blob = await pdf(
                <SkillGapPDF data={data} targetRole={targetRole} />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${targetRole.replace(/\s+/g, "_")}_Skill_Gap_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Skill Gap PDF downloaded! 📄", { id: "skillgap-pdf" });
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate PDF", { id: "skillgap-pdf" });
        }
    };

    return (
        <AppLayout pageTitle="AI Skill Gap Analysis">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header & Search */}
                <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 sm:p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h2 className="text-3xl font-black text-black uppercase tracking-tight pb-1">
                                Where are you heading?
                            </h2>
                            <p className="font-bold text-gray-600 max-w-xl">
                                Enter your target dream role. PlacementBot will analyze real-time market job descriptions (JDs) and compare them against your current profile skills.
                            </p>
                        </div>

                        <div className="w-full md:w-96 flex-shrink-0">
                            <form onSubmit={handleSearch} className="relative flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-secondary-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-28 py-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none text-sm font-bold transition-all"
                                    placeholder="e.g. Data Scientist..."
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                                    <Button type="submit" size="sm" className="h-9 px-4">
                                        Analyze
                                    </Button>
                                </div>
                            </form>

                            {/* Suggestions */}
                            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="text-xs text-secondary-500 py-1">Suggestions:</span>
                                {COMMON_ROLES.slice(0, 3).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => handleSuggestionClick(role)}
                                        className="text-xs font-bold uppercase tracking-wider bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000] hover:bg-gray-100 hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all"
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 flex flex-col items-center justify-center space-y-4">
                        <Spinner size="lg" className="text-primary-600" />
                        <p className="text-secondary-600 animate-pulse font-medium">Scanning hundreds of industry JDs for {targetRole}...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 flex items-center justify-center rounded-full">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-800">Analysis Failed</h3>
                            <p className="text-red-600 mt-1 max-w-md mx-auto">
                                {error.response?.data?.detail || error.message || "We encountered an error querying the AI. Please try again."}
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
                    </div>
                )}

                {/* Results */}
                {!isLoading && !isError && data && (
                    <div className="space-y-6 animate-fade-in-up">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Present Skills */}
                            <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle className="w-6 h-6 text-black" />
                                    <h3 className="font-black text-xl uppercase tracking-wider text-black">Your Skills</h3>
                                </div>
                                <div className="flex-1">
                                    {data.present_skills && data.present_skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {data.present_skills.map(s => (
                                                <span key={s} className="px-3 py-1 bg-white border-2 border-black font-bold text-xs uppercase tracking-wider text-black">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-500 italic">No skills listed in profile. Update your Resume Wizard first!</p>
                                    )}
                                </div>
                            </div>

                            {/* Required Skills (Market) */}
                            <div className="bg-[#FFCC00] border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lightbulb className="w-6 h-6 text-black" />
                                    <h3 className="font-black text-xl uppercase tracking-wider text-black">Market Demands</h3>
                                </div>
                                <div className="flex-1">
                                    {data.required_skills && data.required_skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {data.required_skills.map(s => (
                                                <span key={s} className="px-3 py-1 bg-white border-2 border-black font-bold text-xs uppercase tracking-wider text-black">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-800 italic">Could not extract demands for this role.</p>
                                    )}
                                </div>
                            </div>

                            {/* Missing Skills (Gap) */}
                            <div className="bg-[#E53955] border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                    <h3 className="font-black text-xl uppercase tracking-wider text-white">Skill Gap</h3>
                                </div>
                                <div className="flex-1">
                                    {data.gap && data.gap.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {data.gap.map(s => (
                                                <span key={s} className="px-3 py-1 bg-black text-white border-2 border-black font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#fff]">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                                            <span className="text-4xl text-white font-black">🎉</span>
                                            <p className="text-sm text-white font-black uppercase tracking-widest">No gap detected!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* AI Action Plan */}
                        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-black text-white border-2 border-black">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-black">AI Learning Path</h3>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">Gemini-generated steps to close your gap for <strong className="text-black">{targetRole}</strong></p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {data.learning_path && data.learning_path.length > 0 ? (
                                    data.learning_path.map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-5 bg-white border-[3px] border-dashed border-gray-300 hover:border-black transition-all group">
                                            <div className="flex-shrink-0 w-10 h-10 border-[3px] border-black bg-[#FFCC00] text-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_#000] group-hover:bg-black group-hover:text-[#FFCC00] transition-colors">
                                                {idx + 1}
                                            </div>
                                            <p className="text-black font-bold text-sm leading-relaxed mt-2 pt-0.5">
                                                {step}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-black font-bold italic p-4 bg-white border-[3px] border-dashed border-black">
                                        No learning path generated.
                                    </p>
                                )}
                            </div>

                            {data.gap && data.gap.length > 0 && (
                                <div className="mt-8 flex justify-end">
                                    <Button variant="outline" className="text-black" onClick={handleExportPlan}>
                                        Export Plan <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
