import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { pdf } from "@react-pdf/renderer";

import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { ResumePDF } from "../../utils/pdf/ResumePDF";
import AppLayout from "../../components/layout/AppLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import StepperProgress from "../../components/ui/StepperProgress";
import Spinner from "../../components/ui/Spinner";

// ── Zod schemas per step ──────────────────────────────────────────────────────
const stepSchemas = [
    z.object({
        full_name: z.string().min(2, "Name is required"),
        branch: z.string().min(1, "Branch is required"),
        year_of_passing: z.coerce.number().int().min(2020).max(2035),
        cgpa: z.coerce.number().min(0).max(10),
        backlogs: z.coerce.number().int().min(0),
    }),
    z.object({}),
    z.object({}),
];

const BRANCHES = ["CSE", "ISE", "ECE", "EEE", "ME", "CV", "IT", "AI/ML", "DS"];
const STEPS = ["Academic Details", "Skills", "Projects"];

export default function ResumeWizard() {
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [projects, setProjects] = useState([]);
    const [saving, setSaving] = useState(false);

    // ── Fetch existing profile ─────────────────────────────────────────────────
    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ["student-profile", user?.uid],
        queryFn: () => api.get("/api/students/me").then((r) => r.data),
        enabled: !!user,
        retry: false,  // 404 = no profile yet, that's fine
    });

    // ── Form ───────────────────────────────────────────────────────────────────
    const { register, handleSubmit, getValues, reset, formState: { errors } } = useForm({
        resolver: zodResolver(stepSchemas[0]),
        defaultValues: { full_name: "", branch: "", year_of_passing: 2025, cgpa: "", backlogs: 0 },
    });

    // Pre-populate form when profile loads
    useEffect(() => {
        if (profileData) {
            reset({
                full_name: profileData.full_name || "",
                branch: profileData.branch || "",
                year_of_passing: profileData.year_of_passing || 2025,
                cgpa: profileData.academics?.cgpa ?? "",
                backlogs: profileData.academics?.backlogs ?? 0,
            });
            if (profileData.skills?.length) setSkills(profileData.skills);
            if (profileData.projects?.length) setProjects(profileData.projects);
        } else {
            reset({
                full_name: "",
                branch: "",
                year_of_passing: 2025,
                cgpa: "",
                backlogs: 0,
            });
            setSkills([]);
            setProjects([]);
            // Clear form if no profile
        }
    }, [profileData, reset]);

    const isExisting = !!profileData;

    // ── Skill tag helpers ──────────────────────────────────────────────────────
    const addSkill = () => {
        const s = skillInput.trim().toLowerCase();
        if (s && !skills.includes(s) && skills.length < 50) {
            setSkills([...skills, s]);
            setSkillInput("");
        }
    };

    // ── Project helpers ────────────────────────────────────────────────────────
    const addProject = () => setProjects([...projects, { title: "", description: "", tech_stack: "", link: "" }]);
    const updateProject = (idx, field, val) => setProjects(projects.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
    const removeProject = (idx) => setProjects(projects.filter((_, i) => i !== idx));

    // ── Step navigation ────────────────────────────────────────────────────────
    const nextFromStep0 = handleSubmit(() => setStep(1));
    const goNext = () => {
        if (step === 0) { nextFromStep0(); return; }
        if (step < STEPS.length - 1) setStep(step + 1);
    };

    // ── Save profile & Generate PDF ────────────────────────────────────────────
    const saveProfile = async (generatePdf = false) => {
        const v = getValues();

        if (generatePdf && skills.length === 0) {
            toast.error("Add at least one skill to generate a resume.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                full_name: v.full_name,
                branch: v.branch.toUpperCase(),
                year_of_passing: Number(v.year_of_passing),
                academics: { cgpa: Number(v.cgpa), backlogs: Number(v.backlogs) },
                skills,
                projects,
            };

            // 1. Initial save
            await api.put("/api/students/profile", payload);

            if (generatePdf) {
                toast.loading("Generating PDF...", { id: "pdf-toast" });

                // 2. Generate PDF locally
                const blob = await pdf(<ResumePDF data={payload} />).toBlob();

                // 3. Trigger auto-download
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${v.full_name.replace(/\s+/g, "_")}_Resume.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // 4. Upload to Cloudinary (Free Tier)
                toast.loading("Uploading to cloud...", { id: "pdf-toast" });

                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

                let downloadURL = "";

                if (cloudName && uploadPreset) {
                    const formData = new FormData();
                    formData.append("file", blob);
                    formData.append("upload_preset", uploadPreset);

                    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) {
                        throw new Error("Failed to upload to Cloudinary. Check your CloudName and UploadPreset.");
                    }
                    const data = await res.json();
                    downloadURL = data.secure_url;
                } else {
                    console.warn("Cloudinary env vars missing. Skipping cloud upload.");
                }

                // 5. Save URL back to MongoDB
                await api.put("/api/students/profile", { ...payload, resume_url: downloadURL });
                toast.success("Profile saved and Resume generated! 🎉", { id: "pdf-toast" });
            } else {
                toast.success(isExisting ? "Profile updated! ✅" : "Profile saved! 🎉");
            }
        } catch (err) {
            console.error("Profile save or PDF generation failed:", err);
            toast.error(err.response?.data?.detail || err.message || "Failed to process request.", { id: "pdf-toast" });
        } finally {
            setSaving(false);
        }
    };

    if (profileLoading) {
        return (
            <AppLayout pageTitle="Resume Wizard">
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" className="text-primary-600" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout pageTitle="Resume Wizard">
            <div className="max-w-2xl mx-auto">
                {/* Status banner for existing profiles */}
                {isExisting && (
                    <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                        ✅ Your profile is saved. You can update it below and save again.
                    </div>
                )}

                {/* Stepper */}
                <div className="mb-8">
                    <StepperProgress steps={STEPS} currentStep={step} />
                </div>

                {/* ── Step 0: Academic Details ──────────────────────────────────── */}
                {step === 0 && (
                    <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 space-y-4 animate-fade-in">
                        <h2 className="text-2xl font-black uppercase tracking-wider text-black mb-4">Academic Details</h2>
                        <Input label="Full Name" error={errors.full_name?.message} required {...register("full_name")} />
                        <Select
                            label="Branch"
                            options={BRANCHES}
                            placeholder="Select branch"
                            error={errors.branch?.message}
                            required
                            {...register("branch")}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Year of Passing" type="number" error={errors.year_of_passing?.message} required {...register("year_of_passing")} />
                            <Input label="CGPA" type="number" step="0.01" placeholder="e.g. 8.5" error={errors.cgpa?.message} required {...register("cgpa")} />
                        </div>
                        <Input label="Active Backlogs" type="number" min="0" error={errors.backlogs?.message} {...register("backlogs")} />
                    </div>
                )}

                {/* ── Step 1: Skills ────────────────────────────────────────────── */}
                {step === 1 && (
                    <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 animate-fade-in">
                        <h2 className="text-2xl font-black uppercase tracking-wider text-black mb-6">Skills</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                                placeholder="Type a skill and press Enter"
                                className="flex-1 px-4 py-3 text-sm font-bold border-[3px] border-black focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_0px_#000] focus:shadow-none transition-all"
                            />
                            <Button variant="secondary" size="sm" onClick={addSkill} className="py-3 px-6">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[48px]">
                            {skills.map((s) => (
                                <span key={s} className="inline-flex items-center gap-1 bg-white border-2 border-black text-black text-xs font-bold uppercase tracking-wider px-3 py-1.5 shadow-[2px_2px_0px_0px_#000]">
                                    {s}
                                    <button onClick={() => setSkills(skills.filter((x) => x !== s))} className="hover:text-[#E53955] font-black text-lg ml-1 leading-none">&times;</button>
                                </span>
                            ))}
                            {skills.length === 0 && <p className="text-sm font-bold text-gray-500 italic uppercase">No skills added yet</p>}
                        </div>
                    </div>
                )}

                {/* ── Step 2: Projects ──────────────────────────────────────────── */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-black uppercase tracking-wider text-black">Projects</h2>
                            {projects.length < 20 && (
                                <Button variant="secondary" size="sm" onClick={addProject}>+ Add Project</Button>
                            )}
                        </div>
                        {projects.length === 0 && (
                            <p className="text-sm font-bold text-gray-500 italic uppercase text-center py-6 border-[3px] border-dashed border-gray-300">No projects added. Click "+ Add Project" to begin.</p>
                        )}
                        {projects.map((p, idx) => (
                            <div key={idx} className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 space-y-4">
                                <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
                                    <span className="text-lg font-black uppercase tracking-wider text-black">Project {idx + 1}</span>
                                    <button onClick={() => removeProject(idx)} className="text-xs font-bold uppercase tracking-widest text-[#E53955] hover:text-black hover:underline">Remove</button>
                                </div>
                                <Input label="Title" value={p.title} onChange={(e) => updateProject(idx, "title", e.target.value)} required />
                                <Input label="Description" value={p.description} onChange={(e) => updateProject(idx, "description", e.target.value)} />
                                <Input label="Tech Stack" value={p.tech_stack} onChange={(e) => updateProject(idx, "tech_stack", e.target.value)} placeholder="React, FastAPI, MongoDB" />
                                <Input label="Link (optional)" value={p.link} onChange={(e) => updateProject(idx, "link", e.target.value)} placeholder="https://github.com/..." />
                            </div>
                        ))}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                    <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                        ← Back
                    </Button>
                    {step < STEPS.length - 1 ? (
                        <Button onClick={goNext}>Next →</Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => saveProfile(false)} loading={saving}>
                                Save Draft
                            </Button>
                            <Button onClick={() => saveProfile(true)} loading={saving}>
                                Generate Profile & PDF 📄
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
