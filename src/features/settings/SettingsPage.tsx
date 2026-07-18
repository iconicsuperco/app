export function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <SettingSection title="Audio">
          <SettingRow label="Crossfade" description="Smooth transition between tracks" />
          <SettingRow label="Gapless Playback" description="Seamless playback between tracks" />
          <SettingRow label="Equalizer" description="Customize audio frequencies" />
        </SettingSection>
        <SettingSection title="Appearance">
          <SettingRow label="Theme" description="Dark, Midnight, or Ocean" />
          <SettingRow label="Accent Color" description="Customize the app accent color" />
        </SettingSection>
        <SettingSection title="Data">
          <SettingRow label="Export Library" description="Download your library data as JSON" />
          <SettingRow label="Clear Library" description="Remove all music and data" />
        </SettingSection>
      </div>
    </div>
  )
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muse-text-muted uppercase tracking-wider">{title}</h2>
      <div className="bg-muse-bg-surface rounded-xl border border-muse-glass-border divide-y divide-muse-glass-border">
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-medium text-muse-text">{label}</p>
        <p className="text-xs text-muse-text-muted">{description}</p>
      </div>
      <div className="w-10 h-6 rounded-full bg-muse-bg-hover" />
    </div>
  )
}
