import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Edit3, Check, X, Loader2,
  UtensilsCrossed, Coffee, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { messService } from '../../services/messService';
import { Skeleton } from '../../components/Skeleton';

const MEAL_TABS = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee },
  { key: 'lunch',     label: 'Lunch',     icon: Sun },
  { key: 'dinner',   label: 'Dinner',    icon: Moon },
];

const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all bg-white";
const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5";

const EMPTY_FORM = { name: '', description: '', price: '', is_veg: true };

const OwnerMenuManager = () => {
  const navigate = useNavigate();
  const [mess, setMess] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('lunch');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async () => {
    try {
      const messes = await messService.getOwnerMesses();
      if (messes.length === 0) { navigate('/owner/onboarding'); return; }
      const m = messes[0];
      setMess(m);
      const items = await messService.getMenu(m.id);
      setMenuItems(Array.isArray(items) ? items : []);
    } catch (e) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredItems = menuItems.filter(item => item.meal_type === activeTab && item.is_active);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price ? String(item.price) : '',
      is_veg: item.is_veg,
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_FORM); };

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Item name required'); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        meal_type: activeTab,
        price: form.price ? parseFloat(form.price) : null,
        is_veg: form.is_veg,
      };
      const created = await messService.addMenuItem(mess.id, payload);
      setMenuItems(prev => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowAddForm(false);
      toast.success('Menu item added!');
    } catch (e) {
      toast.error(e.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (itemId) => {
    if (!form.name.trim()) { toast.error('Item name required'); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        meal_type: activeTab,
        price: form.price ? parseFloat(form.price) : null,
        is_veg: form.is_veg,
      };
      const updated = await messService.updateMenuItem(mess.id, itemId, payload);
      setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updated } : item));
      setEditingId(null);
      setForm(EMPTY_FORM);
      toast.success('Item updated!');
    } catch (e) {
      toast.error(e.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    setDeletingId(itemId);
    try {
      await messService.deleteMenuItem(mess.id, itemId);
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed');
    } catch (e) {
      toast.error(e.message || 'Failed to remove');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-12 w-full rounded-2xl mb-6" />
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl mb-3" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/owner/dashboard')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Menu Manager</h1>
            <p className="text-slate-500 text-sm font-medium">{mess?.name}</p>
          </div>
        </div>

        {/* Meal Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm">
          {MEAL_TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === key ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <Icon className="w-4 h-4" /> {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/20' : 'bg-slate-100'}`}>
                {menuItems.filter(i => i.meal_type === key && i.is_active).length}
              </span>
            </button>
          ))}
        </div>

        {/* Add Item Button */}
        {!showAddForm && !editingId && (
          <button onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-orange-300 text-orange-500 font-bold text-sm py-4 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all mb-5">
            <Plus className="w-4 h-4" /> Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Item
          </button>
        )}

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-[24px] border-2 border-orange-200 shadow-sm p-5 mb-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Item</h3>
              <ItemForm form={form} setField={setField} />
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 disabled:opacity-60">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {submitting ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 && !showAddForm && (
            <div className="text-center py-16 bg-white rounded-[24px] border border-slate-100">
              <UtensilsCrossed className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">No {activeTab} items yet</p>
              <p className="text-slate-300 text-xs mt-1">Click above to add your first item</p>
            </div>
          )}
          <AnimatePresence>
            {filteredItems.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
                {editingId === item.id ? (
                  <div className="p-5 border-l-4 border-orange-500">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Edit Item</h4>
                    <ItemForm form={form} setField={setField} />
                    <div className="flex gap-2 mt-3">
                      <button onClick={cancelEdit} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs">
                        Cancel
                      </button>
                      <button onClick={() => handleUpdate(item.id)} disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 text-white py-2 rounded-xl font-bold text-xs disabled:opacity-60">
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${item.is_veg ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      {item.is_veg ? '🥗' : '🍖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                      {item.description && <p className="text-xs text-slate-400 truncate">{item.description}</p>}
                      {item.price && <p className="text-xs font-bold text-orange-500 mt-0.5">₹{Number(item.price).toFixed(0)}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => startEdit(item)}
                        className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-orange-50 hover:text-orange-500 flex items-center justify-center transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}
                        className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-40">
                        {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const ItemForm = ({ form, setField }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Item Name *</label>
      <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all bg-white"
        value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Dal Rice, Paneer Sabzi..." />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price (₹)</label>
        <input type="number" min="0" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all bg-white"
          value={form.price} onChange={e => setField('price', e.target.value)} placeholder="Optional" />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
        <div className="flex gap-2 h-[42px]">
          {[{ v: true, l: '🥗 Veg' }, { v: false, l: '🍖 Non-Veg' }].map(({ v, l }) => (
            <button key={String(v)} type="button" onClick={() => setField('is_veg', v)}
              className={`flex-1 text-xs font-bold rounded-xl transition-all ${form.is_veg === v ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
      <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all bg-white"
        value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Optional description..." />
    </div>
  </div>
);

export default OwnerMenuManager;
