import React, { useState, useEffect } from "react";
import { workoutsApi } from "../../api/workouts";
import { Spinner } from "../ui/Spinner";

export default function TemplatePicker({ isOpen, onClose, onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await workoutsApi.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (templateId) => {
    try {
      // Fetch the full template to get all exercises
      const fullTemplate = await workoutsApi.getTemplate(templateId);
      onSelect(fullTemplate);
    } catch (err) {
      console.error("Failed to load full template details", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-50 flex items-center justify-center">
      <div className="modal-panel max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="modal-header border-b border-neutral-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-neutral-900">Load Template</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-neutral-50/30">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : templates.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              You haven't saved any templates yet. <br/>
              Build a workout and click "Save as Template" to create one.
            </div>
          ) : (
            <div className="grid gap-3">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className="text-left p-4 bg-white border border-neutral-200 rounded-xl hover:border-violet-300 hover:shadow-sm transition-all flex justify-between items-center group"
                >
                  <div>
                    <h3 className="font-bold text-neutral-900">{t.title}</h3>
                    {t.notes && <p className="text-sm text-neutral-500 truncate max-w-sm mt-1">{t.notes}</p>}
                    <p className="text-xs text-neutral-400 mt-2 font-medium">
                      {t.exercise_count} exercises • Created {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-violet-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Load &rarr;
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
