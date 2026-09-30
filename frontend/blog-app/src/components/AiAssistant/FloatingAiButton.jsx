import { LuSparkles } from "react-icons/lu";

const FloatingAiButton = ({ onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-linear-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-700 hover:to-sky-600 text-white font-bold text-xs md:text-sm px-4 py-3 md:px-5 md:py-3.5 rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group"
            title="Buka AI Writer Assistant"
        >
            <span className="p-1 bg-white/20 rounded-full group-hover:rotate-12 transition-transform">
                <LuSparkles className="text-base text-amber-300" />
            </span>
            <span className="tracking-wide">AI Writer Assistant</span>
        </button>
    );
};

export default FloatingAiButton;
