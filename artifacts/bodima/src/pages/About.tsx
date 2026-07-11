import { Link } from 'wouter';

export default function About() {
  return (
    <div className="bg-[#f7f4ef] min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="relative py-24 bg-[#1a3c5e] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl text-gray-300 font-light leading-relaxed">
            To provide every university student in Sri Lanka with a safe, affordable, and comfortable place to call home during their academic journey.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="font-serif text-3xl font-bold text-[#1a3c5e] mb-6">The Bodima Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Finding a good boarding place used to mean walking for miles, reading torn notices on telephone poles, and hoping for the best. We knew there had to be a better way.
                </p>
                <p>
                  Started by a group of former university students, <strong>Bodima.lk</strong> was built to solve the exact problems we faced: hidden fees, false promises, and unsafe environments.
                </p>
                <p>
                  Today, we verify every single listing on our platform. We read the reviews. We listen to the students. Because we believe your environment dictates your success.
                </p>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-[#e8a045] rounded-3xl transform -rotate-3 scale-105"></div>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" alt="Students" className="relative z-10 rounded-3xl w-full object-cover shadow-2xl h-[400px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-[#1a3c5e] mb-4">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#e8a045]/10 text-[#e8a045] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">Safety First</h3>
              <p className="text-gray-500">Every host and property is verified to ensure student safety and well-being.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#1a3c5e]/10 text-[#1a3c5e] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">Transparency</h3>
              <p className="text-gray-500">No hidden fees or surprised. What you see is exactly what you get.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#c0392b]/10 text-[#c0392b] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">Community</h3>
              <p className="text-gray-500">Fostering a supportive environment between students and trusted property owners.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a3c5e] mb-6">Ready to find your place?</h2>
        <Link href="/search" className="btn-primary text-lg px-8 py-4 inline-block">Start Searching</Link>
      </section>
    </div>
  );
}
