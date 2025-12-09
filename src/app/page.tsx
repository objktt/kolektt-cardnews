
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30 font-sans">
      {/* Navbar */}
      <nav className="border-b border-neutral-900/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-lg font-bold">K</span>
            </div>
            Kolektt.AI
          </div>
          <div className="flex items-center gap-4">
             <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Sign In</Link>
             <Link href="/signup" className="text-sm font-medium px-5 py-2.5 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="pt-32 pb-16 px-6 relative overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

         <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Sparkles size={12} />
                <span>Now with Nano Banana Pro AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 text-white">
                Create Viral <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Card News</span> in Seconds
            </h1>
            
            <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                Stop struggling with design tools. Use AI to generate professional, engaging social media carousels tailored for Instagram and LinkedIn.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <Link href="/editor" className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25">
                    Start Creating For Free
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#features" className="px-8 py-4 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-full font-semibold transition-colors">
                    View Templates
                </Link>
            </div>
         </div>
         
         {/* App Preview Mockup */}
         <div className="mt-20 max-w-6xl mx-auto relative group animate-in fade-in zoom-in-50 duration-1000 delay-300">
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10" />
            <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
                {/* Mockup Content - Placeholder or Screenshot */}
                <div className="aspect-video bg-neutral-900 flex items-center justify-center text-neutral-700 relative overflow-hidden">
                    <div className="grid grid-cols-3 gap-8 p-12 w-full opacity-60 scale-95 hover:scale-100 transition-transform duration-700">
                        <div className="aspect-[4/5] bg-neutral-800 rounded-xl border border-neutral-700 shadow-xl" />
                        <div className="aspect-[4/5] bg-neutral-800 rounded-xl border border-neutral-700 shadow-2xl translate-y-8 bg-indigo-900/10" />
                        <div className="aspect-[4/5] bg-neutral-800 rounded-xl border border-neutral-700 shadow-xl" />
                    </div>
                </div>
            </div>
         </div>
      </main>
    </div>
  );
}
