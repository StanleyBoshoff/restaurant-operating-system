import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import SummaryCard from '../common/SummaryCard';
import { PenTool, Plus, Save, Trash2, ChevronRight, GripVertical, Check, X, Zap, ListChecks, Calendar } from 'lucide-react';
import NotificationModal from '../common/NotificationModal';

const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAYS_CONFIG = [
  { id: 'mon', label: 'M', name: 'Monday' },
  { id: 'tue', label: 'T', name: 'Tuesday' },
  { id: 'wed', label: 'W', name: 'Wednesday' },
  { id: 'thu', label: 'T', name: 'Thursday' },
  { id: 'fri', label: 'F', name: 'Friday' },
  { id: 'sat', label: 'S', name: 'Saturday' },
  { id: 'sun', label: 'S', name: 'Sunday' }
];

export default function TabCustom() {
  const [checklists, setChecklists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Month Calendar Picker Modal State
  const [activePickerItemId, setActivePickerItemId] = useState(null);

  // Form State for a new Checklist
  const [newListData, setNewListData] = useState({ name: '', category: 'General', description: '' });
  const [showNewForm, setShowNewNewForm] = useState(false);

  // Custom Notification Modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null
  });

  const notify = (title, message, type = 'warning', onConfirm = null) => {
    setModalConfig({ isOpen: true, type, title, message, onConfirm });
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      fetchItems(selectedList.id);
    }
  }, [selectedList]);

  const fetchChecklists = async () => {
    setLoading(true);
    const { data } = await supabase.from('checklists').select('*').order('name');
    setChecklists(data || []);
    setLoading(false);
  };

  const fetchItems = async (listId) => {
    const { data } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', listId)
      .order('sort_order', { ascending: true });

    const parsed = (data || []).map(i => ({
      ...i,
      is_mandatory: i.is_mandatory !== false, // 🚀 Standard: Mandatory true by default
      frequency_mode: i.frequency_mode || 'Normal',
      scheduled_days: i.scheduled_days && Array.isArray(i.scheduled_days) && i.scheduled_days.length > 0 ? i.scheduled_days : ALL_DAYS,
      scheduled_month_days: i.scheduled_month_days && Array.isArray(i.scheduled_month_days) ? i.scheduled_month_days : [1]
    }));
    setItems(parsed);
  };

  const handleCreateChecklist = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('checklists').insert([newListData]).select().single();
    if (error) return notify("Creation Failed", error.message, 'error');
    setChecklists([...checklists, data]);
    setSelectedList(data);
    setShowNewNewForm(false);
    setNewListData({ name: '', category: 'General', description: '' });
    notify("Checksheet Created", `Checksheet "${data.name}" created successfully. You can now add tasks below.`, 'success');
  };

  const handleAddItem = () => {
    const newItem = {
      id: 'temp-' + Date.now(),
      task_description: '',
      is_mandatory: true, // 🚀 Mandatory ticked by default to avoid compliance gaps
      enabled_options: ['tick', 'cross'],
      frequency_mode: 'Normal', // 'Normal', 'Monthly', 'Weekly'
      scheduled_days: ALL_DAYS, // Standard: All 7 days ticked by default
      scheduled_month_days: [1],
      sort_order: items.length
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const toggleOption = (itemId, option) => {
     const item = items.find(i => i.id === itemId);
     let newOptions = [...(item.enabled_options || ['tick', 'cross'])];
     if (newOptions.includes(option)) {
         newOptions = newOptions.filter(o => o !== option);
     } else {
         newOptions.push(option);
     }
     handleUpdateItem(itemId, 'enabled_options', newOptions);
  };

  const toggleDay = (itemId, dayId) => {
     const item = items.find(i => i.id === itemId);
     const currentDays = item.scheduled_days || ALL_DAYS;
     let newDays;
     if (currentDays.includes(dayId)) {
        newDays = currentDays.filter(d => d !== dayId);
     } else {
        newDays = [...currentDays, dayId];
     }
     handleUpdateItem(itemId, 'scheduled_days', newDays);
  };

  const toggleMonthDay = (itemId, mDayId) => {
     const item = items.find(i => i.id === itemId);
     const currentDays = item.scheduled_month_days || [1];
     let newDays;
     if (currentDays.includes(mDayId)) {
        newDays = currentDays.filter(d => d !== mDayId);
     } else {
        newDays = [...currentDays, mDayId];
     }
     handleUpdateItem(itemId, 'scheduled_month_days', newDays);
  };

  const handleSaveItems = async () => {
    if (!selectedList) return;
    setIsSaving(true);
    try {
      // 1. Delete existing items for this checklist
      await supabase.from('checklist_items').delete().eq('checklist_id', selectedList.id);

      // 2. Prepare new items
      const toInsert = items.map((item, idx) => ({
        checklist_id: selectedList.id,
        task_description: item.task_description,
        is_mandatory: item.is_mandatory,
        enabled_options: item.enabled_options || ['tick', 'cross'],
        frequency_mode: item.frequency_mode || 'Normal',
        scheduled_days: item.scheduled_days || ALL_DAYS,
        scheduled_month_days: item.scheduled_month_days || [1],
        sort_order: idx
      }));

      const { error } = await supabase.from('checklist_items').insert(toInsert);
      if (error) throw error;

      notify("Checksheet Published", `${selectedList.name} tasks updated and published successfully.`, 'success');
      fetchItems(selectedList.id);
    } catch (err) {
      notify("Save Error", "Failed to update items: " + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChecklist = async (id) => {
     notify(
       "Delete Checksheet?",
       `Are you sure you want to permanently delete "${selectedList?.name}" and all its tasks?`,
       'warning',
       async () => {
         const { error } = await supabase.from('checklists').delete().eq('id', id);
         if (error) notify("Delete Error", error.message, 'error');
         else {
             setChecklists(checklists.filter(c => c.id !== id));
             if (selectedList?.id === id) setSelectedList(null);
             notify("Checksheet Deleted", "Checksheet removed successfully.", 'info');
         }
       }
     );
  };

  if (loading) return <div className="py-20 text-center italic text-slate-400">Loading master checksheets...</div>;

  const targetPickerItem = items.find(i => i.id === activePickerItemId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Checklist Library */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Checksheet Library</h4>
              <button
                onClick={() => setShowNewNewForm(!showNewForm)}
                className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
              </button>
           </div>

           {showNewForm && (
             <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-xl animate-in slide-in-from-top-4">
                <form onSubmit={handleCreateChecklist} className="space-y-4">
                   <input
                     type="text" required placeholder="Checksheet Name (e.g. FOH Opening)"
                     value={newListData.name} onChange={e => setNewListData({...newListData, name: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black"
                   />
                   <select
                     value={newListData.category} onChange={e => setNewListData({...newListData, category: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold"
                   >
                      <option value="General">General Category</option>
                      <option value="Kitchen">Kitchen Operations</option>
                      <option value="FOH">Front of House</option>
                      <option value="Bar">Bar & Beverage</option>
                      <option value="Cleaning">Cleaning & Hygiene</option>
                   </select>
                   <textarea
                     placeholder="Short Description..."
                     value={newListData.description} onChange={e => setNewListData({...newListData, description: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium h-20"
                   />
                   <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setShowNewNewForm(false)} className="py-2.5 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                      <button type="submit" className="bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg cursor-pointer">Create List</button>
                   </div>
                </form>
             </div>
           )}

           <div className="space-y-2">
              {checklists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setSelectedList(list)}
                  className={`w-full group text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    selectedList?.id === list.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-x-2'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div>
                     <p className="text-xs font-black uppercase tracking-tight leading-none mb-1">{list.name}</p>
                     <p className={`text-[8px] font-bold uppercase tracking-widest ${selectedList?.id === list.id ? 'text-slate-400' : 'text-slate-300'}`}>{list.category}</p>
                  </div>
                  <ChevronRight size={16} className={selectedList?.id === list.id ? 'text-yellow-500' : 'text-slate-200'} />
                </button>
              ))}
           </div>
        </div>

        {/* RIGHT: Item Designer */}
        <div className="lg:col-span-2">
           {!selectedList ? (
             <div className="h-full min-h-[400px] border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4 shadow-inner">
                   <ListChecks size={32} />
                </div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Checksheet Designer</h4>
                <p className="text-[10px] text-slate-300 font-bold uppercase mt-2 italic max-w-xs">Select a checksheet from the library to edit its tasks.</p>
             </div>
           ) : (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                         <PenTool size={24} />
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{selectedList.name}</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedList.description || 'No description provided'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteChecklist(selectedList.id)}
                        className="p-3 text-slate-300 hover:text-rose-600 transition-all active:scale-75 cursor-pointer"
                        title="Delete Entire Checklist"
                      >
                         <Trash2 size={18} />
                      </button>
                      <button
                        onClick={handleSaveItems}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                         <Save size={16} />
                         {isSaving ? 'Syncing...' : 'Publish Checksheet'}
                      </button>
                   </div>
                </div>

                <div className="space-y-3">
                   {items.map((item, idx) => {
                     const currentDays = item.scheduled_days || ALL_DAYS;
                     const currentMonthDays = item.scheduled_month_days || [1];
                     const mode = item.frequency_mode || 'Normal';

                     return (
                       <div key={item.id} className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-3 group hover:shadow-lg transition-all hover:border-slate-200">
                          <div className="flex items-center gap-4">
                             <div className="cursor-grab active:cursor-grabbing text-slate-200 group-hover:text-slate-400 transition-colors">
                                <GripVertical size={18} />
                             </div>

                             <input
                               type="text" placeholder="Task description..."
                               value={item.task_description} onChange={e => handleUpdateItem(item.id, 'task_description', e.target.value)}
                               className="flex-1 bg-transparent text-xs font-bold text-slate-900 outline-none border-b border-transparent focus:border-slate-900 pb-1"
                             />

                             <button
                               onClick={() => setItems(items.filter(i => i.id !== item.id))}
                               className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                             >
                                <X size={14} />
                             </button>
                          </div>

                          {/* Controls Row: Mode Selector + Days Selector + Options + Mandatory */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pl-8 pt-2 border-t border-slate-50">

                             {/* Frequency Mode Selector (Normal, Monthly, Weekly) */}
                             <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mode:</span>
                                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                   {['Normal', 'Monthly', 'Weekly'].map(m => (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => handleUpdateItem(item.id, 'frequency_mode', m)}
                                        className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase transition-all ${
                                           mode === m
                                           ? 'bg-slate-900 text-white shadow-xs'
                                           : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                      >
                                         {m}
                                      </button>
                                   ))}
                                </div>
                             </div>

                             {/* Active Days Selector depending on Mode */}
                             {mode === 'Monthly' ? (
                                <div className="flex items-center gap-2">
                                   <button
                                     type="button"
                                     onClick={() => setActivePickerItemId(item.id)}
                                     className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border border-emerald-200 flex items-center gap-1.5 shadow-xs"
                                   >
                                      <Calendar size={12} />
                                      Calendar View ({currentMonthDays.length} Selected)
                                   </button>
                                </div>
                             ) : (
                                <div className="flex items-center gap-1">
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-1">Active Days:</span>
                                   {DAYS_CONFIG.map(day => {
                                      const isSelected = currentDays.includes(day.id);
                                      return (
                                         <button
                                           key={day.id}
                                           type="button"
                                           onClick={() => toggleDay(item.id, day.id)}
                                           className={`w-6 h-6 rounded-lg text-[8px] font-black uppercase transition-all ${
                                              isSelected
                                              ? 'bg-slate-900 text-white shadow-xs'
                                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                           }`}
                                           title={`Toggle ${day.name}`}
                                         >
                                            {day.label}
                                         </button>
                                      );
                                   })}
                                </div>
                             )}

                             {/* Options + Mandatory Checkbox */}
                             <div className="flex items-center gap-3">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Buttons:</span>
                                <div className="flex items-center gap-1.5">
                                   <button
                                     onClick={() => toggleOption(item.id, 'tick')}
                                     className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${item.enabled_options?.includes('tick') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300 opacity-40'}`}
                                     title="Toggle Tick Button"
                                   >
                                      <Check size={12} strokeWidth={3} />
                                   </button>
                                   <button
                                     onClick={() => toggleOption(item.id, 'cross')}
                                     className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${item.enabled_options?.includes('cross') ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-300 opacity-40'}`}
                                     title="Toggle Cross Button"
                                   >
                                      <X size={12} strokeWidth={3} />
                                   </button>
                                   <button
                                     onClick={() => toggleOption(item.id, 'prep')}
                                     className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${item.enabled_options?.includes('prep') ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 opacity-40'}`}
                                     title="Toggle Prep Button"
                                   >
                                      <Zap size={12} strokeWidth={3} />
                                   </button>
                                   <button
                                     onClick={() => toggleOption(item.id, 'fill')}
                                     className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${item.enabled_options?.includes('fill') ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-300 opacity-40'}`}
                                     title="Toggle Fill Button"
                                   >
                                      <Zap size={12} strokeWidth={3} fill="currentColor" />
                                   </button>
                                </div>

                                <div className="w-px h-5 bg-slate-100 mx-1" />

                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                   <input
                                     type="checkbox" checked={item.is_mandatory !== false}
                                     onChange={e => handleUpdateItem(item.id, 'is_mandatory', e.target.checked)}
                                     className="w-3.5 h-3.5 rounded border-slate-200 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                   />
                                   <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">Mandatory</span>
                                </label>
                             </div>

                          </div>
                       </div>
                     );
                   })}

                   <button
                     onClick={handleAddItem}
                     className="w-full py-4 border-2 border-dashed border-slate-100 rounded-3xl text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
                   >
                      <Plus size={14} /> Add Task Item
                   </button>
                </div>
             </div>
           )}
        </div>

      </div>

      {/* MONTHLY CALENDAR DAY PICKER MODAL (Numbers 1 to 31 + LD) */}
      {targetPickerItem && (
         <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-xs sm:max-w-sm shadow-2xl border border-slate-200 p-5 space-y-3 animate-in zoom-in-95 duration-300">

               <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                     <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                        <Calendar size={16} />
                     </div>
                     <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Calendar Day Picker</h3>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Select Month Days (1-31 or LD)</p>
                     </div>
                  </div>
                  <button onClick={() => setActivePickerItemId(null)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100">
                     <X size={16} />
                  </button>
               </div>

               <div className="space-y-3">
                  <p className="text-[9px] text-slate-500 font-medium leading-tight">
                     Select numerical days when <span className="font-bold text-slate-900">"{targetPickerItem.task_description || 'this task'}"</span> should appear:
                  </p>

                  {/* 31-Day Grid View */}
                  <div className="grid grid-cols-7 gap-1.5 pt-1">
                     {[...Array(31)].map((_, i) => {
                        const dayNum = i + 1;
                        const isSelected = (targetPickerItem.scheduled_month_days || [1]).includes(dayNum);

                        return (
                           <button
                             key={dayNum}
                             type="button"
                             onClick={() => toggleMonthDay(targetPickerItem.id, dayNum)}
                             className={`h-7 rounded-lg text-[10px] font-black transition-all flex items-center justify-center ${
                                isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                             }`}
                           >
                              {dayNum}
                           </button>
                        );
                     })}
                  </div>

                  {/* Special LD (Last Day of Month) Button */}
                  <div className="pt-2 border-t border-slate-100">
                     <button
                       type="button"
                       onClick={() => toggleMonthDay(targetPickerItem.id, 'LD')}
                       className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                          (targetPickerItem.scheduled_month_days || [1]).includes('LD')
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                       }`}
                     >
                        <Calendar size={12} /> Toggle LD (Last Day of Month)
                     </button>
                     <p className="text-[7px] font-bold text-slate-400 text-center uppercase tracking-widest mt-1 italic">
                        LD auto-detects month end (Feb 28/29, Apr 30, Dec 31).
                     </p>
                  </div>
               </div>

               <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setActivePickerItemId(null)}
                    className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all shadow-md"
                  >
                     Done
                  </button>
               </div>

            </div>
         </div>
      )}

      <NotificationModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
      />

    </div>
  );
}
