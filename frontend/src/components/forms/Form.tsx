import React, { useState } from 'react';
import { FormProps } from '@/types/components';
import { API_BASE_URL } from '@/config';

const Form: React.FC<FormProps> = ({ pageId, fields, submitText, onSubmit, layout = 'card' }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      if (onSubmit) {
        await onSubmit(formData);
        setSubmitMessage('提交成功！我们会尽快联系您。');
        setFormData({});
      } else {
        const response = await fetch(`${API_BASE_URL}/leads/submit/${pageId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSubmitMessage('提交成功！我们会尽快联系您。');
          setFormData({});
        } else {
          setSubmitMessage('提交失败，请重试。');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('提交失败，请重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (layout === 'inline') {
    return (
      <div className="max-w-4xl mx-auto p-4 bg-white rounded-2xl shadow-lg border border-slate-100">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          {fields.map((field, index) => (
            <div key={index} className="flex-grow">
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
                className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                placeholder={field.label}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 whitespace-nowrap disabled:opacity-50"
          >
            {isSubmitting ? '...' : submitText}
          </button>
        </form>
        {submitMessage && (
          <div className={`mt-4 text-sm font-bold ${submitMessage.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
            {submitMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto p-8 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 ${layout === 'floating' ? '-mt-24 relative z-20' : ''}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field, index) => (
          <div key={index}>
            <label htmlFor={field.name} className="block text-sm font-black text-slate-700 mb-2 ml-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-slate-900 shadow-inner"
              placeholder={`请输入${field.label}`}
            />
          </div>
        ))}
        
        {submitMessage && (
          <div className={`text-sm font-bold ${submitMessage.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
            {submitMessage}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-8 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : submitText}
        </button>
      </form>
    </div>
  );
};

export default Form;