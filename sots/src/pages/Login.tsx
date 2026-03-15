import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col md:flex-row items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Animated neon orbs */}
      <div className="absolute top-[-30%] left-[-15%] w-[70vw] h-[70vw] bg-[rgba(0,240,255,0.06)] rounded-full blur-[180px] mix-blend-screen pointer-events-none animate-float"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-[rgba(124,58,237,0.06)] rounded-full blur-[200px] mix-blend-screen pointer-events-none animate-float" style={{ animationDelay: '-3s' }}></div>
      <div className="absolute top-[30%] left-[50%] w-[40vw] h-[40vw] bg-[rgba(255,0,110,0.04)] rounded-full blur-[150px] mix-blend-screen pointer-events-none animate-float" style={{ animationDelay: '-5s' }}></div>

      <div className="relative w-full max-w-7xl mx-auto z-10 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center slide-up">
        {/* Massive Typography Section */}
        <div className="text-left space-y-5">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-xl rounded-xl px-4 py-2 mb-4 border border-[rgba(0,240,255,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" style={{ boxShadow: '0 0 8px rgba(0, 240, 255, 0.8)' }} />
            <span className="font-mono text-[10px] font-bold tracking-[4px] text-neon-cyan uppercase">
              Next-Gen Simulator
            </span>
          </div>
          
          <h1 className="font-heading text-6xl md:text-7xl lg:text-[8rem] leading-[0.9] font-black text-white tracking-tighter">
            Survival <br />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#7c3aed] to-[#ff006e]"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              State.
            </span>
          </h1>
          
          <p className="font-body text-base md:text-lg text-muted/70 max-w-md leading-relaxed mt-6">
            Take command of your nation's resources, forge complex industries, and negotiate global trade in real-time.
          </p>

          {/* Decorative stats */}
          <div className="flex gap-6 mt-8">
            {[
              { label: 'Nations', value: '10+' },
              { label: 'Resources', value: '8' },
              { label: 'Industries', value: '40+' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-2xl text-neon-cyan tracking-wider" style={{ textShadow: '0 0 15px rgba(0,240,255,0.4)' }}>
                  {stat.value}
                </div>
                <div className="text-[9px] font-mono text-muted tracking-[3px] uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md mx-auto md:ml-auto">
          <form onSubmit={handleSubmit} className="relative overflow-hidden bg-card/60 backdrop-blur-2xl border border-[rgba(0,240,255,0.08)] rounded-3xl p-8 md:p-10 space-y-6 shadow-[0_0_40px_rgba(0,240,255,0.05),0_25px_50px_rgba(0,0,0,0.5)]">
            {/* Top neon accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.5)] to-transparent" />
            
            {/* Scan-lines */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden" style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 240, 255, 0.008) 3px, rgba(0, 240, 255, 0.008) 6px)',
            }} />

            <div className="relative z-10 space-y-6">
              <div className="mb-4">
                <h2 className="font-heading text-xl font-bold text-white tracking-[3px]">Access Terminal</h2>
                <p className="text-xs font-mono text-muted mt-2 tracking-wider">Enter your secured country credentials</p>
              </div>

              {error && (
                <div className="bg-[rgba(255,45,91,0.06)] border border-[rgba(255,45,91,0.2)] rounded-xl px-4 py-3 text-xs font-mono text-neon-red flex items-center gap-3">
                  <span className="text-lg">✖</span> {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold text-muted uppercase tracking-[3px]">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@country.gov"
                    required
                    className="w-full bg-base/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-5 py-3.5
                               font-mono text-sm text-white placeholder:text-muted/30
                               focus:outline-none focus:border-[rgba(0,240,255,0.4)] focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]
                               transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold text-muted uppercase tracking-[3px]">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-base/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-5 py-3.5
                               font-mono text-sm text-white placeholder:text-muted/30
                               focus:outline-none focus:border-[rgba(0,240,255,0.4)] focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]
                               transition-all duration-300"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-4 py-4 text-sm tracking-[4px]"
                loading={loading}
              >
                ⚡ Initialize Session
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 text-[9px] font-mono text-muted/30 uppercase tracking-[4px]">
            SOTS ⸺ {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
