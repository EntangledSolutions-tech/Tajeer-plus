export function AuthLayoutShell({
  children,
  Logo,
}: React.PropsWithChildren<{
  Logo?: React.ComponentType;
}>) {
  return (
    <div
      className="relative flex h-screen w-full items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #4ade80 0%, #3b82f6 100%)',
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('/images/User Login Background image/BG Image [2x].png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Logo positioned at top right */}
      {Logo && (
        <div className="absolute top-6 left-6 text-white">
          <Logo />
        </div>
      )}

      {/* Language switcher positioned at top right */}
      {/* <div className="absolute top-6 right-6">
        <button className="px-4 py-2 text-white border border-white/30 rounded-lg text-sm hover:bg-white/10 transition-colors">
          العربية
        </button>
      </div> */}

      {/* Auth Form Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
