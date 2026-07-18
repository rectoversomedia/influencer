import Link from 'next/link';
import { ChartLineUp, Users, Megaphone, ShieldCheck, Lightning, ArrowRight } from '@phosphor-icons/react/dist/ssr';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ChartLineUp className="h-5 w-5 text-white" weight="bold" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Rectoverso
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/login"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8">
              <Lightning className="h-4 w-4" weight="fill" />
              Influencer Marketing Made Simple
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-tight">
              Manage Your
              <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Influencer Campaigns
              </span>
              With Confidence
            </h1>

            <p className="mt-8 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Track performance, manage reports, and measure ROI across all your influencer partnerships in one powerful platform.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/login"
                className="group flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" weight="bold" />
              </Link>
              <Link
                href="#features"
                className="flex items-center gap-2 px-8 py-4 text-lg font-medium text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Powerful features to manage your entire influencer ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Megaphone,
                title: 'Campaign Management',
                description: 'Create and manage influencer campaigns with customizable metrics and requirements.',
                gradient: 'from-indigo-500 to-indigo-600',
                delay: '0ms',
              },
              {
                icon: ChartLineUp,
                title: 'Performance Analytics',
                description: 'Real-time dashboards with automatic screenshot OCR to extract metrics instantly.',
                gradient: 'from-violet-500 to-violet-600',
                delay: '100ms',
              },
              {
                icon: Users,
                title: 'Influencer Portal',
                description: 'Dedicated portal for influencers to submit reports with automated screenshot analysis.',
                gradient: 'from-purple-500 to-purple-600',
                delay: '200ms',
              },
              {
                icon: ShieldCheck,
                title: 'Client Dashboard',
                description: 'Give your clients their own dashboard to track campaign progress and results.',
                gradient: 'from-emerald-500 to-emerald-600',
                delay: '300ms',
              },
              {
                icon: Lightning,
                title: 'OCR Automation',
                description: 'Automatically extract numbers from screenshots using advanced OCR technology.',
                gradient: 'from-amber-500 to-amber-600',
                delay: '400ms',
              },
              {
                icon: ShieldCheck,
                title: 'Three User Roles',
                description: 'Superadmin, Client, and Influencer - each with their own secure access.',
                gradient: 'from-rose-500 to-rose-600',
                delay: '500ms',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" weight="bold" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <br />Influencer Marketing?
          </h2>

          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join hundreds of brands who trust Rectoverso to manage their influencer partnerships.
          </p>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-indigo-600 bg-white rounded-2xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5" weight="bold" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <ChartLineUp className="h-5 w-5 text-white" weight="bold" />
              </div>
              <span className="text-xl font-bold">Rectoverso</span>
            </div>

            <p className="text-slate-400 text-sm">
              © 2024 Rectoverso. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
