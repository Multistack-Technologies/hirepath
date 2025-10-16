interface FindWorkErrorProps {
  message: string;
  onRetry?: () => void;
}

export default function FindWorkError({ message, onRetry }: FindWorkErrorProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
}