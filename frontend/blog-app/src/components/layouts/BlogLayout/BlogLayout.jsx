import BlogNavbar from "./BlogNavbar";

const BlogLayout = ({ children, activeMenu }) => {
    return (
        <div className="min-h-screen bg-[#f7fafe] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col justify-between">
            <div>
                <BlogNavbar activeMenu={activeMenu} />
                <main className="container mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-10">
                    {children}
                </main>
            </div>

            {/* Public Responsive Footer */}
            <footer className="border-t border-gray-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 py-8 px-4 text-center mt-16 transition-colors duration-200">
                <div className="container mx-auto space-y-1.5">
                    <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                        Lingkaran Koding • Platform Edukasi & AI-Powered Tech Blog
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">
                        Dibangun dengan React 19, Tailwind CSS v4 & Intelligent AI Assistant.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default BlogLayout;
