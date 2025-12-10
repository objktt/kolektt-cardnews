import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Palette, Share2, Clock, CheckCircle, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30 font-sans">
      {/* Navbar */}
      <nav className="border-b border-neutral-900/50 backdrop-blur-md fixed top-0 w-full z-50 bg-neutral-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <img src="/logo.png" alt="Kardyy" className="w-7 h-7 brightness-0 invert" />
            Kardyy
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-neutral-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-neutral-400 hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm text-neutral-400 hover:text-white transition-colors">Pricing</a>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8">
            <Sparkles size={12} />
            <span>Powered by Gemini AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight text-white">
            Create Viral <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Card News</span> in Seconds
          </h1>

          <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto">
            Stop struggling with design tools. Use AI to generate professional, engaging social media carousels tailored for Instagram and LinkedIn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25">
              Start Creating For Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="px-8 py-4 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-full font-semibold transition-colors">
              Learn More
            </a>
          </div>
        </div>

        {/* App Preview Mockup */}
        <div className="mt-20 max-w-6xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10" />
          <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
            <div className="aspect-video bg-neutral-900 flex items-center justify-center text-neutral-700 relative overflow-hidden">
              <div className="grid grid-cols-3 gap-8 p-12 w-full opacity-60 scale-95 hover:scale-100 transition-transform duration-700">
                <div className="aspect-[4/5] bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl border border-neutral-700 shadow-xl" />
                <div className="aspect-[4/5] bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-neutral-700 shadow-2xl translate-y-8" />
                <div className="aspect-[4/5] bg-gradient-to-br from-pink-900/30 to-orange-900/30 rounded-xl border border-neutral-700 shadow-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trusted By / Stats */}
      <section className="py-16 border-y border-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-sm text-neutral-500">Cards Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">2K+</div>
              <div className="text-sm text-neutral-500">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-sm text-neutral-500">Templates</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">4.9</div>
              <div className="text-sm text-neutral-500">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Create stunning card news with powerful AI-driven features designed for content creators and marketers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-indigo-500/50 transition-all hover:bg-neutral-900">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                <Zap className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Generation</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Generate professional card designs instantly with Gemini AI. Just enter your topic and let AI do the magic.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/50 transition-all hover:bg-neutral-900">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Palette className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Beautiful Templates</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Choose from 50+ professionally designed templates. Customize colors, fonts, and layouts to match your brand.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-pink-500/50 transition-all hover:bg-neutral-900">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition-colors">
                <Share2 className="text-pink-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Platform Export</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Export optimized for Instagram, LinkedIn, Twitter. Download as images or video slideshows.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-green-500/50 transition-all hover:bg-neutral-900">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <Clock className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save Hours of Work</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                What used to take hours now takes minutes. Create a week's worth of content in one sitting.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-orange-500/50 transition-all hover:bg-neutral-900">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                <Star className="text-orange-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Brand Consistency</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Save your brand colors, fonts, and logo. Apply them instantly to any design you create.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-cyan-500/50 transition-all hover:bg-neutral-900">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                <CheckCircle className="text-cyan-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Draft & Schedule</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Save drafts and organize your content calendar. Plan your social media posts in advance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Create professional card news in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-8xl font-bold text-neutral-800/50 absolute -top-8 -left-4">1</div>
              <div className="relative z-10 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25">
                  <Sparkles className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Enter Your Topic</h3>
                <p className="text-neutral-400">
                  Type in your topic or paste your content. Our AI will analyze and structure it for maximum engagement.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-8xl font-bold text-neutral-800/50 absolute -top-8 -left-4">2</div>
              <div className="relative z-10 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                  <Palette className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Customize Design</h3>
                <p className="text-neutral-400">
                  Choose templates, adjust colors, fonts, and layouts. Make it uniquely yours with our intuitive editor.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="text-8xl font-bold text-neutral-800/50 absolute -top-8 -left-4">3</div>
              <div className="relative z-10 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/25">
                  <Share2 className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Export & Share</h3>
                <p className="text-neutral-400">
                  Download as images or video. Share directly to your favorite social platforms with one click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by Creators</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Join thousands of content creators who save hours every week
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-neutral-300 mb-6">
                "This tool has completely transformed my content creation workflow. What used to take me 2 hours now takes 10 minutes."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                <div>
                  <div className="font-medium">Sarah Kim</div>
                  <div className="text-sm text-neutral-500">Content Creator</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-neutral-300 mb-6">
                "The AI suggestions are incredibly smart. It understands my brand and creates content that resonates with my audience."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                <div>
                  <div className="font-medium">David Park</div>
                  <div className="text-sm text-neutral-500">Marketing Manager</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-neutral-300 mb-6">
                "Finally, a tool that makes professional designs accessible. My LinkedIn engagement has increased 300% since I started using it."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500" />
                <div>
                  <div className="font-medium">Emily Chen</div>
                  <div className="text-sm text-neutral-500">Startup Founder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24 px-6 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Start for free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <div className="text-sm text-neutral-500 font-medium mb-2">Free</div>
              <div className="text-4xl font-bold mb-1">$0</div>
              <div className="text-sm text-neutral-500 mb-6">Forever free</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  5 cards per month
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Basic templates
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  PNG export
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 text-center rounded-full border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors font-medium">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-indigo-900/50 to-neutral-900/50 border border-indigo-500/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 rounded-full text-xs font-medium">
                Most Popular
              </div>
              <div className="text-sm text-indigo-400 font-medium mb-2">Pro</div>
              <div className="text-4xl font-bold mb-1">$12</div>
              <div className="text-sm text-neutral-500 mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Unlimited cards
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  All templates
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Video export
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Brand kit
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 text-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors font-medium">
                Start Free Trial
              </Link>
            </div>

            {/* Team Plan */}
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
              <div className="text-sm text-neutral-500 font-medium mb-2">Team</div>
              <div className="text-4xl font-bold mb-1">$29</div>
              <div className="text-sm text-neutral-500 mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  5 team members
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Shared workspace
                </li>
                <li className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle size={16} className="text-green-400" />
                  Priority support
                </li>
              </ul>
              <Link href="/signup" className="block w-full py-3 text-center rounded-full border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors font-medium">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Create Amazing Content?
          </h2>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Join thousands of creators who are already using Kardyy to grow their audience.
          </p>
          <Link href="/signup" className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-white/10">
            Start Creating For Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-6 text-sm text-neutral-500">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight mb-4">
                <img src="/logo.png" alt="Kardyy" className="w-7 h-7 brightness-0 invert" />
                Kardyy
              </div>
              <p className="text-sm text-neutral-500 mb-6">
                Create viral card news in seconds with AI-powered design tools.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-neutral-500 hover:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" className="text-neutral-500 hover:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                  </svg>
                </a>
                <a href="#" className="text-neutral-500 hover:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <div className="font-semibold mb-4">Product</div>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-neutral-500 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-neutral-500 hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/editor" className="text-sm text-neutral-500 hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-4">Company</div>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-4">Legal</div>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-neutral-600">
              © 2024 Kardyy. All rights reserved.
            </div>
            <div className="text-sm text-neutral-600">
              Made with ❤️ for content creators
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
