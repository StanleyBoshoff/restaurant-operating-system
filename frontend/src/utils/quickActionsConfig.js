import { Edit, FileUp, AlertCircle, Calendar, Clock, Plus } from 'lucide-react';
import { canDo } from './permissionService';

export const getQuickActions = (currentUser) => {
    return [
        { id: 'can_edit_personnel', label: 'Edit Profile', icon: Edit, path: 'details', color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { id: 'can_submit_forms', label: 'Upload Document', icon: FileUp, path: 'documents', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
        { id: 'can_launch_wizard', label: 'Issue Warning', icon: AlertCircle, path: 'warnings', color: 'text-rose-600', bgColor: 'bg-rose-50' },
        { id: 'can_approve_leave', label: 'Log Leave', icon: Calendar, path: 'leave', color: 'text-amber-600', bgColor: 'bg-amber-50', always: true },
        { id: 'can_view_timesheets', label: 'Attendance', icon: Clock, path: 'time-attendance', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
        { id: 'can_manage_tasks', label: 'Add Note / Task', icon: Plus, path: 'tasks-notes', color: 'text-yellow-600', bgColor: 'bg-yellow-50', always: true },
    ].filter(action => {
        if (action.always) return true;
        return canDo(currentUser, action.id);
    });
};
