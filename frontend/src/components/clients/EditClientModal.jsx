import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { Modal } from "../ui/Modal";
import { clientsApi } from "../../api/clients";

export default function EditClientModal({ isOpen, onClose, client, onClientUpdated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (client && isOpen) {
      setName(client.name || "");
      setEmail(client.email || "");
      setIsActive(client.is_active !== undefined ? client.is_active : true);
      setError("");
      setSuccessMessage("");
    }
  }, [client, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name.trim() || !email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const updated = await clientsApi.updateClient(client.id, {
        name,
        email,
        is_active: isActive,
      });
      setSuccessMessage("Client profile updated successfully.");
      if (onClientUpdated) {
        onClientUpdated(updated);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const errMessage =
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        "Failed to update client profile.";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Client Profile"
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            form="edit-client-form"
            type="submit"
            variant="primary"
            loading={loading}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form id="edit-client-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <Input
          id="edit-client-name"
          label="Full Name"
          placeholder="E.g., Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          id="edit-client-email"
          type="email"
          label="Email Address"
          placeholder="client@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Status Toggle & Deactivation Warning */}
        <div className="pt-2 border-t border-[var(--color-border)]">
          <label className="block text-xs font-bold text-[var(--color-steel)] uppercase tracking-wider mb-2">
            Account Status
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] ${
                isActive ? "bg-emerald-500" : "bg-neutral-300"
              }`}
              role="switch"
              aria-checked={isActive}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm font-semibold text-[var(--color-ink)]">
              {isActive ? "Active Roster" : "Inactive (Deactivated)"}
            </span>
          </div>

          {!isActive && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-md)] text-xs text-amber-800 leading-relaxed font-medium">
              <strong className="font-bold">Deactivation Note:</strong> Deactivating a client removes them from active assignment views but preserves all historical workouts, logs, and progress metrics.
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
