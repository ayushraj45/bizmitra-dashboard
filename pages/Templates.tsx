
import React, { useState, useEffect } from 'react';
import { getTemplates, addTemplate } from '../services/api';
import { MessageTemplate, TemplateStatus } from '../types';
import Modal from '../components/Modal';

const statusColorMapping = {
    [TemplateStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [TemplateStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [TemplateStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const TemplateForm: React.FC<{ onSave: (data: any) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', language: 'English', content: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Template Name (e.g., welcome_message)" required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            <select name="language" value={formData.language} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
            </select>
            <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Template Content (use {{1}}, {{2}} for variables)" rows={4} required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">Create Template</button>
            </div>
        </form>
    );
};

const TemplateCard: React.FC<{ template: MessageTemplate }> = ({ template }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{template.name}</h3>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColorMapping[template.status]}`}>{template.status}</span>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Language: {template.language}</p>
        <p className="text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md whitespace-pre-wrap font-mono text-sm">{template.content}</p>
    </div>
);


const Templates: React.FC = () => {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTemplatesData = async () => {
        setIsLoading(true);
        try {
            const data = await getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTemplatesData();
    }, []);

    const handleSaveTemplate = async (templateData: any) => {
        try {
            await addTemplate(templateData);
            await fetchTemplatesData();
        } catch (error) {
            console.error("Failed to save template:", error);
        } finally {
            setIsModalOpen(false);
        }
    };


    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading templates...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
             <div className="flex justify-end mb-6">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Create New Template
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                ))}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Message Template">
                <TemplateForm onSave={handleSaveTemplate} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Templates;
