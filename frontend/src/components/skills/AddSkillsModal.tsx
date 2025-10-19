// components/skills/AddSkillsModal.tsx
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { Skill } from "@/types";
import api from "@/lib/api";
import { Toast, useToast } from "@/context/ToastContext";

interface AddSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillsAdded: (skills: Skill[]) => void;
  existingSkills?: Skill[];
}

export default function AddSkillsModal({
  isOpen,
  onClose,
  onSkillsAdded,
  existingSkills = [],
}: AddSkillsModalProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(existingSkills);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  // Fetch available skills
  useEffect(() => {
    if (isOpen) {
      fetchAvailableSkills();
    }
  }, [isOpen]);

  const fetchAvailableSkills = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Skill[]>("/skills/");
      setAvailableSkills(response.data || []);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillToggle = (skill: Skill) => {
    setSelectedSkills((prev) => {
      const isSelected = prev.some((s) => s.id === skill.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== skill.id);
      } else {
        return [...prev, skill];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update user's skills using the new endpoint
      const skillIds = selectedSkills.map((skill) => skill.id);
      const response = await api.post("/accounts/skills/set/", {
        skill_ids: skillIds,
      });

      onSkillsAdded(selectedSkills);
      addToast({
        type: "success",
        title: "Skills loaded!",
        message: `You have ${selectedSkills.length} skills in your profile.`,
      });
      onClose();
    } catch (error) {
      addToast({
        type: "info",
        title: "Failed To Add Skills",
        message: `Your Selected Skills are not saved`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSkills = availableSkills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const existingSkillIds = existingSkills.map((skill) => skill.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Skills" size="lg">
      <div className="p-6 space-y-4">
        {/* Search Input */}
        <div className="flex-shrink-0">
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Skills Grid - Scrollable area */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading skills...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkills.some(
                  (s) => s.id === skill.id
                );
                const isExisting = existingSkillIds.includes(skill.id);

                return (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillToggle(skill)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-indigo-100 border-indigo-500 text-indigo-800"
                        : "bg-white border-gray-300 text-gray-700 hover:border-indigo-300"
                    } ${isExisting ? "opacity-75" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.name}</span>
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {isExisting && (
                      <span className="text-xs text-gray-500 mt-1">
                        Already added
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && filteredSkills.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>No skills found matching your search.</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Selected Skills Preview */}
        {selectedSkills.length > 0 && (
          <div className="border-t pt-4 flex-shrink-0">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Selected Skills ({selectedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {selectedSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center flex-shrink-0"
                >
                  {skill.name}
                  <button
                    onClick={() => handleSkillToggle(skill)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end space-x-3 pt-4 border-t flex-shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : `Save Skills (${selectedSkills.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
