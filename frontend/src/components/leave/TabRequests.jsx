import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';
import { Check, X, FileText, User, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { notifyManagerOfLeaveApproval } from '../../utils/notificationService';

export default function TabRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employee_leave')
        .select(`
          *,
          employees (
            id,
            first_name,
            last_name,
            role,
            department,
            manager_name,
            manager_id
          )
        `)
        .eq('status', 'Pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching leave requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (request, newStatus) => {
    try {
      setProcessingId(request.id);

      const { error } = await supabase
        .from('employee_leave')
        .update({ status: newStatus })
        .eq('id', request.id);

      if (error) throw error;

      if (newStatus === 'Approved') {
        // Trigger notification sequence
        await notifyManagerOfLeaveApproval(request.employees, request);
      }

      alert(`Request ${newStatus.toLowerCase()} successfully.`);
      fetchRequests();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const openAttachment = async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-files')
        .createSignedUrl(path, 60);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      alert('Could not open attachment: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 italic animate-pulse">Scanning the requests queue...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Requests Queue</h3>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold">
          {requests.length} PENDING APPROVAL
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400 italic">
          The requests queue is currently clear. No pending leave items.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center gap-6">

              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{req.employees?.first_name} {req.employees?.last_name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{req.employees?.role} • {req.employees?.department}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Leave Type</label>
                  <StatusBadge status={req.leave_type} />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Duration</label>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <CalendarIcon size={12} className="text-slate-400" />
                    <span>{req.total_statutory_days_deducted} Statutory Days</span>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Period</label>
                  <p className="text-xs font-medium text-slate-600">
                    {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                {req.attachment_url && (
                  <button
                    onClick={() => openAttachment(req.attachment_url)}
                    className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                    title="View Attachment"
                  >
                    <FileText size={18} />
                  </button>
                )}

                <button
                  disabled={processingId === req.id}
                  onClick={() => handleAction(req, 'Denied')}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 border border-rose-100"
                >
                  <X size={14} /> Deny
                </button>

                <button
                  disabled={processingId === req.id}
                  onClick={() => handleAction(req, 'Approved')}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <Check size={14} className="text-emerald-400" /> Approve
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
