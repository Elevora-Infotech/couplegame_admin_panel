import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2, X, Loader2, Minus } from 'lucide-react';

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    text: '',
    input_type: 'SINGLE_CHOICE',
    options: ['']
  });

  const inputTypes = ['SINGLE_CHOICE', 'TEXT', 'SLIDER'];

  const fetchData = async () => {
    setLoading(true);
    try {
      // NOTE: Fallback in case endpoint doesn't exist yet, but prompt asks to assume it does 
      // or at least write the table to display them. I will call the endpoint and handle 404 gracefully.
      const response = await axiosInstance.get('/admin/dashboard/questions');
      if (response.data?.status === 'success') {
        setQuestions(response.data.data.questions || []);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      if (error.response?.status === 404) {
         // Endpoint not ready, but we'll show empty table
         setQuestions([]);
      } else {
         toast.error('Failed to load questions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (q = null) => {
    if (q) {
      setEditingId(q.id);
      setFormData({
        text: q.text,
        input_type: q.input_type,
        options: q.options && q.options.length > 0 ? q.options : ['']
      });
    } else {
      setEditingId(null);
      setFormData({
        text: '',
        input_type: 'SINGLE_CHOICE',
        options: ['']
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 1) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.text) {
      toast.error('Question text is required');
      return;
    }

    let payload = {
      text: formData.text,
      input_type: formData.input_type
    };

    if (formData.input_type === 'SINGLE_CHOICE') {
      const validOptions = formData.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        toast.error('Single choice requires at least 2 options');
        return;
      }
      payload.options = validOptions;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/admin/dashboard/questions/${editingId}`, payload);
        toast.success('Question updated successfully');
      } else {
        await axiosInstance.post('/admin/dashboard/questions', payload);
        toast.success('Question created successfully');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error("Failed to save: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await axiosInstance.delete(`/admin/dashboard/questions/${id}`);
      toast.success('Question deleted successfully');
      fetchData();
    } catch (error) {
      toast.error("Failed to delete: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Questions</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage the onboarding flow questions.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto border border-slate-700/50 rounded-xl bg-slate-900/40">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-800/90 backdrop-blur z-10 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Question Text</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Input Type</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Options</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading questions...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No questions found. The endpoint may still be in planning.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">{q.text}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-[11px] font-bold tracking-wider">
                        {q.input_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {q.input_type === 'SINGLE_CHOICE' ? `${q.options?.length || 0} Options` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(q)}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(q.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Question' : 'Add New Question'}</h2>
              <button onClick={handleCloseModal} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Question Text</label>
                <input 
                  type="text" 
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  placeholder="e.g., What is your primary love language?"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Input Type</label>
                <select 
                  required
                  value={formData.input_type}
                  onChange={(e) => setFormData({...formData, input_type: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {inputTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {formData.input_type === 'SINGLE_CHOICE' && (
                <div className="space-y-3 bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-300">Options</label>
                  {formData.options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => removeOption(index)}
                        disabled={formData.options.length <= 1}
                        className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-500/50 disabled:opacity-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mt-2 font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add Option
                  </button>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 mt-auto">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
