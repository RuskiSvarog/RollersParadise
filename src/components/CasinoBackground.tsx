// COMPLETELY STATIC BACKGROUND - NO ANIMATIONS, NO FLASHING

export function CasinoBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Simple Static Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
      
      {/* Subtle Static Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Static Corner Accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[150px]" />

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
