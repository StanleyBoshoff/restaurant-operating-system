import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import SummaryCard from '../common/SummaryCard';
import { PenTool, Plus, Save, Trash2, ChevronRight, GripVertical, Check, X, Zap, ListChecks } from 'lucide-react';
import NotificationModal from '../common/NotificationModal';

export default function TabCustom() {
  const [checklists, setChecklists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    setItems(data || []);
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
      is_mandatory: false,
      enabled_options: ['tick', 'cross'],
      sort_order: items.length
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const toggleOption = (itemId, option) => {
     const item = items.find(i => i.id === itemId);
     let newOptions = [...item.enabled_options];
     if (newOptions.includes(option)) {
         newOptions = newOptions.filter(o => o !== option);
     } else {
         newOptions.push(option);
     }
     handleUpdateItem(itemId, 'enabled_options', newOptions);
  };

  const handleSaveItems = async () => {
    if (!selectedList) return;
    setIsSaving(true);
    try {
      await supabase.from('checklist_items').delete().eq('checklist_id', selectedList.id);

      const toInsert = items.map((item, idx) => ({
        checklist_id: selectedList.id,
        task_description: item.task_description,
        is_mandatory: item.is_mandatory,
        enabled_options: item.enabled_options,
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
                   {items.map((item, idx) => (
                     <div key={item.id} className="bg-white border border-slate-100 rounded-3xl p-4 flex items-center gap-4 group hover:shadow-lg transition-all hover:border-slate-200">
                        <div className="cursor-grab active:cursor-grabbing text-slate-200 group-hover:text-slate-400 transition-colors">
                           <GripVertical size={18} />
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                           <input
                             type="text" placeholder="Task description..."
                             value={item.task_description} onChange={e => handleUpdateItem(item.id, 'task_description', e.target.value)}
                             className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none border-b border-transparent focus:border-slate-900 pb-1"
                           />

                           <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Buttons:</span>
                              <div className="flex items-center gap-1.5">
                                 <button
                                   onClick={() => toggleOption(item.id, 'tick')}
                                   className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${item.enabled_options.includes('tick') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300 opacity-40'}`}
                                 >
                                    <Check size={14} strokeWidth={3} />
                                 </button>
                                 <button
                                   onClick={() => toggleOption(item.id, 'cross')}
                                   className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${item.enabled_options.includes('tick') && item.enabled_options.includes('cross') ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-300 opacity-40'}`}
                                 >
                                    <X size={14} strokeWidth={3} />
                                 </button>
                                 <button
                                   onClick={() => toggleOption(item.id, 'prep')}
                                   className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${item.enabled_options.includes('prep') ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 opacity-40'}`}
                                 >
                                    <Zap size={14} strokeWidth={3} />
                                 </button>
                                 <button
                                   onClick={() => toggleOption(item.id, 'fill')}
                                   className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${item.enabled_options.includes('fill') ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-300 opacity-40'}`}
                                 >
                                    <Zap size={14} strokeWidth={3} fill="currentColor" />
                                 </button>
                              </div>

                              <div className="w-px h-6 bg-slate-100 mx-1" />

                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                 <input
                                   type="checkbox" checked={item.is_mandatory}
                                   onChange={e => handleUpdateItem(item.id, 'is_mandatory', e.target.checked)}
                                   className="w-3.5 h-3.5 rounded border-slate-200 text-slate-900 focus:ring-slate-900"
                                 />
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Mandatory</span>
                              </label>

                              <button
                                onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                className="ml-auto p-2 text-slate-200 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                 <X size={14} />
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}

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
