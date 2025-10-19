// components/analytics/Alert.tsx
interface AlertProps {
  type: 'error' | 'success';
  message: string;
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div className={`border rounded-md p-4 ${styles[type]}`}>
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button
          onClick={onClose}
          className={`hover:opacity-70 ${
            type === 'error' ? 'text-red-600' : 'text-green-600'
          }`}
        >
          ×
        </button>
      </div>
    </div>
  );
};