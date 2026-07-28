import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

export default function TabWarnings({ employee }) {
  // Local list and screen-state toggles
  const [warningsList, setWarningsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form data tracking values
  const [warningLevel, setWarningLevel] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [description, setDescription] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWarningId, setEditingWarningId] = useState(null);

  // Fetch historical entries straight from Supabase module table
  const fetchEmployeeWarnings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employee_warnings")
        .select("*")
        .eq("employee_id", employee.id)
        .order("incident_date", { ascending: false });

      if (error) throw error;
      setWarningsList(data || []);
    } catch (error) {
      console.error("Failed to load warnings history:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee?.id) {
      fetchEmployeeWarnings();
    }
  }, [employee?.id]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!warningLevel || !incidentDate || !description || !issuedBy) {
      alert("Please fill out all required logging fields.");
      return;
    }

    try {
      let uploadedPath = null;

      // 1. File Handling Block (retains your solid screenshot uploading engine architecture)
      if (selectedFile) {
        const targetFile = selectedFile;
        const fileExtension = targetFile.name.split(".").pop();
        const uniqueFileName = `${employee.id}/warnings/${Date.now()}_warning.${fileExtension}`;

        const { data: storageData, error: storageError } =
          await supabase.storage
            .from("employee-files")
            .upload(uniqueFileName, targetFile, {
              cacheControl: "3600",
              upsert: false,
            });

        if (storageError) throw storageError;
        uploadedPath = storageData.path;
      }

      // 2. Dynamic Structural Routing: Check if we are running an Insert or an Update transaction query
      if (isEditing) {
        // 🛠️ SURGICAL RE-WRITE (CRUD-Update Transaction Query)
        const updatePayload = {
          warning_level: warningLevel,
          incident_date: incidentDate,
          description: description,
          issued_by: issuedBy,
        };

        // If the manager selected a new screenshot file asset, append the newly generated storage pointer string
        if (uploadedPath) {
          updatePayload.file_url = uploadedPath;
        }

        const { error: updateError } = await supabase
          .from("employee_warnings")
          .update(updatePayload)
          .eq("id", editingWarningId);

        if (updateError) throw updateError;
        alert("Disciplinary record successfully modified in database.");
      } else {
        // 📝 TRADITIONAL MANIFEST GENERATION (CRUD-Create Transaction Insertion Array)
        const { error: insertError } = await supabase
          .from("employee_warnings")
          .insert([
            {
              employee_id: employee.id,
              warning_level: warningLevel,
              incident_date: incidentDate,
              description: description,
              issued_by: issuedBy,
              file_url: uploadedPath,
            },
          ]);

        if (insertError) throw insertError;
        alert("Incident record logged successfully.");
      }

      // 3. Reset form states, text parameters, and clear selection references
      setWarningLevel("");
      setIncidentDate("");
      setDescription("");
      setIssuedBy("");
      setSelectedFile(null);
      setIsEditing(false);
      setEditingWarningId(null);

      const fileInput = document.getElementById("warning-file-picker");
      if (fileInput) fileInput.value = "";

      setIsAdding(false);
      fetchEmployeeWarnings(); // Instantly synchronizes live UI cache
    } catch (error) {
      console.error("Data layer mutation failure:", error.message);
      alert(`Transaction aborted: ${error.message}`);
    }
  };

  const handleDeleteWarning = async (warningId, storageFilePath) => {
    const confirmErase = window.confirm(
      "Are you absolutely certain you want to purge this disciplinary log entry? This operation is permanent.",
    );
    if (!confirmErase) return;

    try {
      setLoading(true);

      // 1. If an attached file asset path exists, evict it from Supabase Storage first
      if (storageFilePath) {
        const { error: storageEvictionError } = await supabase.storage
          .from("employee-files")
          .remove([storageFilePath]);

        if (storageEvictionError) {
          console.error(
            "Storage cleanup anomaly encountered:",
            storageEvictionError.message,
          );
        }
      }

      // 2. Surgical deletion extraction from the PostgreSQL data table
      const { data: serverPayload, error: databaseEvictionError } =
        await supabase
          .from("employee_warnings")
          .delete()
          .eq("id", warningId)
          .select(); // Returns row details to confirm action

      if (databaseEvictionError) throw databaseEvictionError;

      // 3. Evaluation of database rows changed
      if (!serverPayload || serverPayload.length === 0) {
        alert(
          "Database Row Dropped: Request completed, but no rows matched that ID. Please ensure your Supabase table RLS 'DELETE' policies are active.",
        );
      } else {
        alert(
          "Disciplinary log entry successfully purged from active registry.",
        );
      }

      // 4. Force instant live layout cache refresh
      fetchEmployeeWarnings();
    } catch (error) {
      console.error("Purge transaction failure:", error.message);
      alert(`Erase failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditingRecord = (warningItem) => {
    setWarningLevel(warningItem.warning_level);
    setIncidentDate(warningItem.incident_date);
    setDescription(warningItem.description);
    setIssuedBy(warningItem.issued_by);

    setEditingWarningId(warningItem.id); // Captures target row key string identifier
    setIsEditing(true); // Flags system update routing environment
    setIsAdding(true); // Drops open the form interface layout slider
  };

  return (
    <div className="space-y-6">
      {/* Header section with form toggles and upcoming feature badge */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Disciplinary Logs & Compliance Tracking
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical infraction records for{" "}
            {employee?.first_name || "Employee"}.
          </p>
        </div>

        <div className="flex space-x-2">
          {/* Feature reminder promo flag */}
          <div className="bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center space-x-1.5">
            <span>✨ Future Sprint:</span>
            <span className="uppercase tracking-wider">AI Guided Writer</span>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              isAdding
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isAdding ? "Cancel" : "Log New Warning"}
          </button>
        </div>
      </div>

      {isAdding ? (
        /* 📝 BASIC MANIFEST RECORDING FORM */
        <form
          onSubmit={handleFormSubmit}
          className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-4 text-xs"
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                Warning Level
              </label>
              <select
                value={warningLevel}
                onChange={(e) => setWarningLevel(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none"
              >
                <option value="">Select Level...</option>
                <option value="Verbal Warning">Verbal Warning</option>
                <option value="First Written Warning">
                  First Written Warning
                </option>
                <option value="Final Written Warning">
                  Final Written Warning
                </option>
                <option value="Suspension Notice">Suspension Notice</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                Incident Date
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                Issued By (Manager)
              </label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                placeholder="Manager Name"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
              Incident Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Provide a clear factual description of the infraction..."
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semi-bold uppercase tracking-wider">
              Signed Document / screenshot (Optional)
            </label>
            <input
              id="warning-file-picker"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file_font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer shadow-2xs ${
                isEditing
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isEditing ? "Update Incident Record" : "Save Log Record"}
            </button>
          </div>
        </form>
      ) : (
        /* 📋 HISTORICAL INCIDENT LIST & ADVANCED BUILDER TEASER */
        <div className="space-y-4">
          {/* Guided builder placeholder section */}
          <div className="bg-purple-50/40 border border-purple-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>🚀</span> Smart Warning Drafting Blueprint
              </h5>
              <p className="text-[11px] text-purple-700 max-w-xl leading-relaxed">
                You have formal training in drafting airtight disciplinaries,
                but many managers do not. We are reserving this space to build
                an interactive, AI-assisted wizard. It will ask managers key
                operational questions and auto-generate legal warnings matching
                proper labor frameworks.
              </p>
            </div>
          </div>

          {/* Historical Records View */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Incident Registry
            </h5>

            {loading ? (
              <div className="text-center p-6 text-xs text-slate-400 italic animate-pulse">
                Accessing compliance server registries...
              </div>
            ) : warningsList.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-sm text-slate-400">
                Clean record. No historical disciplinary records logged on this
                profile.
              </div>
            ) : (
              <div className="space-y-2">
                {warningsList.map((warningItem) => {
                  // Assign conditional border accent layouts based on warning severity
                  const severityColor = warningItem.warning_level.includes(
                    "Final",
                  )
                    ? "border-l-rose-600 bg-rose-50/10"
                    : warningItem.warning_level.includes("First")
                      ? "border-l-amber-500 bg-amber-50/10"
                      : warningItem.warning_level.includes("Suspension")
                        ? "border-l-slate-900 bg-slate-50/40"
                        : "border-l-yellow-600 bg-yellow-50/10";

                  return (
                    <div
                      key={warningItem.id}
                      className={`p-4 border border-slate-200 border-l-4 ${severityColor} rounded-xl shadow-2xs space-y-2`}
                    >
                      {/* 1. Header Row Element Container */}
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-bold text-slate-900 text-sm">
                          {warningItem.warning_level ||
                            warningItem.warningLevel}
                        </span>

                        <div className="flex items-center space-x-3 text-slate-400">
                          <span className="font-medium">
                            Incident:{" "}
                            {new Date(
                              warningItem.incident_date,
                            ).toLocaleDateString()}
                          </span>

                          <button
                            type="button"
                            onClick={() => startEditingRecord(warningItem)}
                            className="hover:text-amber-600 p-1 rounded-md hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit this record text data"
                          >
                            <svg
                              xmlns="http://w3.org"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* 🗑️ Targeted Delete Switch Action */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteWarning(
                                warningItem.id,
                                warningItem.file_url,
                              )
                            }
                            className="hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer text-slate-400"
                            title="Delete this record"
                          >
                            <svg
                              xmlns="http://w3.org"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* 2. Description Content Box */}
                      <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-2 rounded-lg border border-slate-100">
                        {warningItem.description}
                      </p>

                      {/* 3. Footer Metrics Section Wrapper */}
                      <div className="text-[10px] text-slate-400 font-medium flex justify-between items-center pt-1 border-t border-slate-100">
                        <span>
                          Issued By:{" "}
                          <span className="text-slate-600 font-semibold">
                            {warningItem.issued_by}
                          </span>
                        </span>

                        {/* 📄 Secure Temporary Signed URL Attachment Link Trigger */}
                        {warningItem.file_url && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const { data, error } = await supabase.storage
                                  .from("employee-files")
                                  .createSignedUrl(warningItem.file_url, 60);

                                if (error) throw error;
                                if (data?.signedUrl)
                                  window.open(data.signedUrl, "_blank");
                              } catch (err) {
                                console.error("Link token error:", err.message);
                                alert(
                                  "Could not generate secure file preview access authorization.",
                                );
                              }
                            }}
                            className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md hover:bg-purple-100 transition-colors cursor-pointer"
                          >
                            View Attached Screenshot
                          </button>
                        )}

                        <span>
                          Logged:{" "}
                          {new Date(
                            warningItem.created_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
