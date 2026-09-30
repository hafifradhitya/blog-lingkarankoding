import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LuCopy, LuCheck } from "react-icons/lu";

// Subkomponen untuk blok kode dengan tombol Copy to Clipboard
const CodeBlock = ({ children, className }) => {
    const [copied, setCopied] = useState(false);
    const codeString = String(children).replace(/\n$/, "");

    // Ambil nama bahasa dari className (contoh: "language-javascript")
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Gagal menyalin kode:", err);
        }
    };

    return (
        <div className="relative group my-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg text-slate-100">
            {/* Code Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
                <span className="uppercase font-semibold tracking-wider text-[11px] text-sky-400">
                    {language || "code"}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg"
                    title="Salin kode"
                >
                    {copied ? (
                        <>
                            <LuCheck className="text-emerald-400 text-sm" />
                            <span className="text-emerald-400 text-[11px]">Tersalin!</span>
                        </>
                    ) : (
                        <>
                            <LuCopy className="text-sm" />
                            <span className="text-[11px]">Salin</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
                <code>{codeString}</code>
            </div>
        </div>
    );
};

const MarkdownRenderer = ({ content }) => {
    return (
        <div className="markdown-content text-gray-800 dark:text-slate-200 leading-relaxed max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3 leading-tight">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-7 mb-3 leading-snug">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-slate-100 mt-6 mb-2 leading-snug">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 dark:text-slate-200 mt-5 mb-2">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-sm md:text-base my-3.5">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1.5 my-3.5 text-gray-700 dark:text-slate-300 text-sm md:text-base pl-2 marker:text-sky-500">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1.5 my-3.5 text-gray-700 dark:text-slate-300 text-sm md:text-base pl-2 marker:text-sky-500 font-medium">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-gray-700 dark:text-slate-300 leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 pl-4 py-2.5 my-5 italic text-gray-700 dark:text-slate-300 rounded-r-xl text-sm md:text-base">
                            {children}
                        </blockquote>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline font-medium transition-colors"
                        >
                            {children}
                        </a>
                    ),
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt || "Ilustrasi artikel"}
                            className="rounded-2xl max-w-full my-6 border border-gray-100 dark:border-slate-800 shadow-md mx-auto object-cover"
                            loading="lazy"
                        />
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 dark:border-slate-800">
                            <table className="w-full text-left border-collapse text-xs md:text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-100/80 dark:bg-slate-800 text-gray-800 dark:text-slate-200 font-semibold border-b border-gray-200 dark:border-slate-700">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">{children}</tr>
                    ),
                    th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
                    td: ({ children }) => (
                        <td className="px-4 py-2.5 text-gray-600 dark:text-slate-300">{children}</td>
                    ),
                    hr: () => <hr className="my-8 border-gray-200 dark:border-slate-800" />,
                    code: ({ inline, className, children, ...props }) => {
                        if (inline) {
                            return (
                                <code
                                    className="bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded text-xs md:text-[13px] font-mono font-medium border border-sky-100 dark:border-sky-800/60"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
