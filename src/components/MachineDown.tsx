export default function MachineDown() {
  return (
    <div className="border-2 border-ink-red/50 bg-paper-deep/40 px-6 py-8 text-center">
      <p className="font-type text-lg text-ink-red mb-2">la máquina está apagada</p>
      <p className="font-mono-poem text-sm text-ink-soft">
        No pudimos hablar con el backend. Revisa que el Query Service esté corriendo y que{" "}
        <code className="text-ink">NEXT_PUBLIC_API_URL</code> apunte a él.
      </p>
    </div>
  );
}
