import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { Modal } from "../ui/Modal";
import { clientsApi } from "../../api/clients";

export default function AddClientModal({ isOpen, onClose, onClientAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await clientsApi.createClient({ name, email });
      setSuccessData(data);
      if (onClientAdded) {
        onClientAdded(data.client);
      }
    } catch (err) {
      const errMessage = err.response?.data?.email?.[0] || err.response?.data?.detail || "Failed to create client.";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setError("");
    setSuccessData(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={successData ? "Client Added!" : "Add New Client"}
      footer={
        successData ? (
          <Button variant="primary" fullWidth onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button form="add-client-form" type="submit" variant="primary" loading={loading}>
              Create Client
            </Button>
          </>
        )
      }
    >
          {successData ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-neutral-900 font-semibold mb-2">
                {successData.client.name} is now on your roster!
              </p>
              <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
                Share this temporary password with them. They will be required to change it on their first login.
              </p>
              
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Temporary Password</p>
                  <p className="font-mono text-lg font-bold text-neutral-900">{successData.temp_password}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(successData.temp_password)}
                >
                  Copy
                </Button>
              </div>
            </div>
          ) : (
            <form id="add-client-form" onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-neutral-500 mb-4">
                Enter your client's details. A temporary password will be automatically generated for them.
              </p>
              
              {error && <Alert variant="danger">{error}</Alert>}

              <Input
                id="client-name"
                label="Full Name"
                placeholder="E.g., Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />

              <Input
                id="client-email"
                type="email"
                label="Email Address"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </form>
          )}
    </Modal>
  );
}

function CheckIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
