import React, { useState } from 'react';
import { FormProps } from '@/types/components';
import { API_BASE_URL } from '@/config';

const Form: React.FC<FormProps> = ({ pageId, fields, submitText, onSubmit }) => {
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

        const result = await response.json();
        
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field, index) => (
          <div key={index}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        
        {submitMessage && (
          <div className={`text-sm ${submitMessage.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
            {submitMessage}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : submitText}
        </button>
      </form>
    </div>
  );
};

export default Form;