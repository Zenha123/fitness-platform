import React, { useState, useEffect } from "react";
import { workoutsApi } from "../../api/workouts";
import { Spinner } from "../ui/Spinner";
import { Modal } from "../ui/Modal";
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Load Template"
      className="max-w-2xl max-h-[80vh] !p-0 overflow-hidden flex flex-col"
    >

        <div className="flex-1 overflow-y-auto p-4 bg-neutral-50/30">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : templates.length === 0 ? (
            <div className="text-center py-10 text-[var(--color-steel)] font-medium">
              You haven't saved any templates yet. <br/>
              Build a workout and click "Save as Template" to create one.
            </div>
          ) : (
            <div className="grid gap-3">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className="text-left p-4 bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] hover:border-[var(--color-ink)] hover:shadow-sm transition-all flex justify-between items-center group"
                >
                  <div>
                    <h3 className="text-xl text-[var(--color-ink)]">{t.title}</h3>
                    {t.notes && <p className="text-sm text-[var(--color-steel)] truncate max-w-sm mt-1 font-medium">{t.notes}</p>}
                    <p className="text-xs text-[var(--color-steel)] mt-2 font-medium">
                      {t.exercise_count} exercises • Created {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-[var(--color-ink)] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Load &rarr;
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
    </Modal>
  );
}


