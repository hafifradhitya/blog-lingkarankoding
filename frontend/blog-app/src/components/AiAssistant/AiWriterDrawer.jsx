import { useState } from "react";
import {
    LuSparkles,
    LuX,
    LuWand,
    LuLightbulb,
    LuSearchCheck,
    LuMessageSquare,
    LuBot,
} from "react-icons/lu";
import DraftGeneratorTab from "./DraftGeneratorTab";
import TitleSuggesterTab from "./TitleSuggesterTab";
import SeoSummaryTab from "./SeoSummaryTab";
import RewriteTab from "./RewriteTab";
import ChatTab from "./ChatTab";

const TABS = [
    { id: "draft", label: "Draft", icon: LuWand, desc: "Buat Draft Lengkap" },
    { id: "title", label: "Judul", icon: LuLightbulb, desc: "Saran Judul SEO" },
    { id: "seo", label: "SEO & Summary", icon: LuSearchCheck, desc: "Ringkasan & Skor" },
    { id: "rewrite", label: "Rewrite", icon: LuSparkles, desc: "Perbaiki Teks" },
    { id: "chat", label: "Chat AI", icon: LuMessageSquare, desc: "Tanya Jawab" },
];

const AiWriterDrawer = ({
    isOpen,
    onClose,
    onApplyDraft,
    onApplyTitleAndSlug,
    onApplySummary,
    onInsertText,
    articleContext,
}) => {
    const [activeTab, setActiveTab] = useState("draft");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Sliding Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <aside className="w-screen max-w-md md:max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-slate-800 transition-colors">
                    {/* Drawer Header */}
                    <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-linear-to-r from-sky-50 via-indigo-50/50 to-white dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                                <LuBot className="text-base" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                        AI Writer Assistant
                                    </h3>
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-linear-to-r from-sky-500 to-indigo-600 text-white px-2 py-0.5 rounded-full">
                                        Smart Assistant
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                    Asisten cerdas pembuatan konten blog profesional
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Tutup Asisten AI"
                        >
                            <LuX className="text-lg" />
                        </button>
                    </div>

                    {/* Navigation Tabs Bar */}
                    <div className="flex items-center border-b border-gray-100 dark:border-slate-800 px-3 bg-gray-50/60 dark:bg-slate-900/60 overflow-x-auto custom-scrollbar">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                        isActive
                                            ? "border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900"
                                            : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                >
                                    <Icon className="text-sm" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Body Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        {activeTab === "draft" && (
                            <DraftGeneratorTab
                                onApplyDraft={onApplyDraft}
                                currentCategory={articleContext?.category}
                            />
                        )}

                        {activeTab === "title" && (
                            <TitleSuggesterTab
                                onApplyTitleAndSlug={onApplyTitleAndSlug}
                                currentContent={articleContext?.content}
                                currentTitle={articleContext?.title}
                            />
                        )}

                        {activeTab === "seo" && (
                            <SeoSummaryTab
                                onApplySummary={onApplySummary}
                                currentContent={articleContext?.content}
                                currentTitle={articleContext?.title}
                                currentTags={articleContext?.tags}
                            />
                        )}

                        {activeTab === "rewrite" && (
                            <RewriteTab
                                onInsertText={onInsertText}
                                currentContent={articleContext?.content}
                            />
                        )}

                        {activeTab === "chat" && (
                            <ChatTab articleContext={articleContext} />
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AiWriterDrawer;
