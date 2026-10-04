import { AlertTriangle, ArrowLeft } from "lucide-react";

interface Props {
  message: string;
  onBack: () => void;
}

export function ReconstructionError({ message, onBack }: Props) {
  return (
    <main className="results-state">
      <div className="error-icon"><AlertTriangle size={28} /></div>
      <h1>Reconstruction unavailable</h1>
      <p>{message}</p>
      <button className="state-button" onClick={onBack}>
        <ArrowLeft size={16} /> Return to explorer
      </button>
    </main>
  );
}
