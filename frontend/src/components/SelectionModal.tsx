import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { SelectableItem } from '@/types';

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsSelected: (itemIds: number[]) => void;
  initialSelectedIds?: number[];
  availableItems: SelectableItem[];
  title: string;
  searchPlaceholder: string;
  isLoading?: boolean;
  renderItem?: (item: SelectableItem, isSelected: boolean, isExisting: boolean) => React.ReactNode;
  emptyStateMessage?: string;
}

export default function SelectionModal({
  isOpen,
  onClose,
  onItemsSelected,
  initialSelectedIds = [],
  availableItems,
  title,
  searchPlaceholder,
  isLoading = false,
  renderItem,
  emptyStateMessage = "No items found matching your search."
}: SelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
      setSearchQuery('');
    }
  }, [isOpen, initialSelectedIds]);

  const handleItemToggle = (itemId: number) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(itemId);
      if (isSelected) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSave = () => {
    onItemsSelected(selectedIds);
    onClose();
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItems = availableItems.filter(item => selectedIds.includes(item.id));
  const selectedCount = selectedIds.length;

  const defaultRenderItem = (item: SelectableItem, isSelected: boolean, isExisting: boolean) => (
    <button
      key={item.id}
      onClick={() => handleItemToggle(item.id)}
      className={`p-3 rounded-lg border text-left transition-all w-full ${
        isSelected
          ? 'bg-indigo-100 border-indigo-500 text-indigo-800 shadow-sm'
          : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-300 hover:shadow-sm'
      } ${isExisting ? 'border-green-200 bg-green-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{item.name}</span>
        <div className="flex items-center">
          {isExisting && (
            <span className="text-xs text-green-600 mr-2">✓</span>
          )}
          {isSelected && (
            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      {isExisting && !isSelected && (
        <span className="text-xs text-green-600 mt-1">Already selected</span>
      )}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <div className="p-6 space-y-4">
        {/* Search Input */}
        <div className="flex-shrink-0">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Items Grid - Scrollable area */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isExisting = initialSelectedIds.includes(item.id);
                return renderItem ? renderItem(item, isSelected, isExisting) : defaultRenderItem(item, isSelected, isExisting);
              })}
            </div>
          )}
          
          {!isLoading && filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{emptyStateMessage}</p>
            </div>
          )}
        </div>

        {/* Selected Items Preview */}
        {selectedCount > 0 && (
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Selected Items ({selectedCount})
              </h4>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center flex-shrink-0"
                >
                  {item.name}
                  <button
                    onClick={() => handleItemToggle(item.id)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
          <div className="text-sm text-gray-500">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={selectedCount === 0}
            >
              Save {selectedCount} Item{selectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}