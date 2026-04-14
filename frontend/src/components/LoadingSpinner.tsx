type LoadingSpinnerProps = {
  label?: string;
};

export function LoadingSpinner({ label = 'Chargement' }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 text-base-content/70">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
