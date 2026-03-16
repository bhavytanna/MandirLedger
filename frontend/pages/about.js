import Layout from '../components/Layout';

export default function About() {
  const creatorImageUrl = process.env.NEXT_PUBLIC_CREATOR_IMAGE_URL || '/creator.jpg';
  return (
    <Layout title="About the Creator">

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-2 badge mb-4">
            <span className="flame">🪔</span>
            <span>Developer & Visionary</span>
            <span className="flame">🪔</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
            Bhavy Tanna
          </h1>
          <div className="lotus-divider max-w-xs mx-auto mb-6">
            <span>🪷</span>
          </div>
          <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-lg leading-relaxed">
            The creator behind MandirLedger, dedicated to merging modern technology with sacred tradition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center divine-card p-8 md:p-12 mb-16">
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full p-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #dc2626)' }}>
              <div className="w-full h-full rounded-full overflow-hidden bg-stone-900 border-4 border-stone-900 relative">
                <img
                  src={creatorImageUrl}
                  alt="Bhavy Tanna"
                  className="absolute inset-0 w-full h-full object-cover object-[center_20%] scale-[1.15]"
                />
              </div>
              {/* Divine pulse ring behind image */}
              <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl -z-10 animate-pulse-slow"></div>
            </div>
          </div>
          <div className="md:col-span-8 text-center md:text-left space-y-6">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200" style={{ fontFamily: "'Cinzel', serif" }}>
              My Journey
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Welcome! I'm <span className="font-semibold text-amber-700 dark:text-amber-500">Bhavy Tanna</span>. 
              I built MandirLedger because I saw a profound need for transparency and devotion in managing temple 
              contributions. By bringing high-end, secure digital ledgers to sacred spaces, my mission is to 
              ensure every rupee is honoured and accounted for.
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Through beautiful, divine user interfaces and robust backend logic, MandirLedger stands as a 
              testament to bridging faith with the future. Enjoy the seamless experience and peace of mind 
              knowing exactly how the temple's funds are thriving.
            </p>
            <div className="pt-4 mt-2 border-t border-amber-100/50 dark:border-amber-900/30">
              <p className="text-sm font-medium italic text-stone-500 dark:text-stone-400">
                "Transparent. Accountable. Blessed."
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
