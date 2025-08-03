

import React, { useState, useEffect } from 'react';
import { getTemplates, addTemplate } from '../services/api';
import { MessageTemplate, TemplateStatus, TemplateCategory } from '../types';
import Modal from '../components/Modal';

const statusColorMapping = {
    [TemplateStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [TemplateStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [TemplateStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

interface TemplateFormData {
    name: string;
    language: string;
    category: TemplateCategory;
    text: string;
    exampleValues: string[];
}

const TemplateForm: React.FC<{ onSave: (data: any) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState<TemplateFormData>({
        name: '',
        language: 'en_US',
        category: TemplateCategory.UTILITY,
        text: '',
        exampleValues: ['']
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleExampleValueChange = (index: number, value: string) => {
        const newExampleValues = [...formData.exampleValues];
        newExampleValues[index] = value;
        setFormData({ ...formData, exampleValues: newExampleValues });
    };

    const addExampleValue = () => {
        setFormData({ ...formData, exampleValues: [...formData.exampleValues, ''] });
    };

    const removeExampleValue = (index: number) => {
        const newExampleValues = formData.exampleValues.filter((_, i) => i !== index);
        setFormData({ ...formData, exampleValues: newExampleValues });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const templatePayload = {
            name: formData.name,
            language: formData.language,
            category: formData.category,
            components: [
                {
                    type: 'BODY',
                    text: formData.text,
                    example: {
                        body_text: [formData.exampleValues.filter(v => v.trim() !== '')]
                    }
                }
            ]
        };
        onSave(templatePayload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Template Name (e.g., welcome_message)" required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="language" value={formData.language} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (GB)</option>
                    <option value="es_ES">Spanish</option>
                    <option value="fr_FR">French</option>
                </select>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    {Object.values(TemplateCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            
            <textarea name="text" value={formData.text} onChange={handleChange} placeholder="Template body (e.g., Your appointment with {{1}} is confirmed!)" rows={4} required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Example Body Variables</label>
                <div className="space-y-2">
                    {formData.exampleValues.map((value, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleExampleValueChange(index, e.target.value)}
                                placeholder={`Example for {{${index + 1}}}`}
                                className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                             <button type="button" onClick={() => removeExampleValue(index)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addExampleValue} className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Add Variable
                </button>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">Create Template</button>
            </div>
        </form>
    );
};

const TemplateCard: React.FC<{ template: MessageTemplate }> = ({ template }) => {
    const bodyComponent = template.components?.find(c => c.type === 'BODY');
    const exampleValues = bodyComponent?.example?.body_text?.[0] || [];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 flex flex-col h-full">
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 break-all">{template.name}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColorMapping[template.status]}`}>{template.status}</span>
                </div>
                <div className="flex items-center space-x-4 mb-3 text-sm">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Lang: {template.language}</span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">Category: {template.category}</span>
                </div>
                {bodyComponent && (
                    <p className="text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md whitespace-pre-wrap font-mono text-sm">
                        {bodyComponent.text}
                    </p>
                )}
                {exampleValues.length > 0 && (
                     <div className="mt-3">
                        <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Example Values</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {exampleValues.map((val, index) => (
                                <span key={index} className="px-2 py-1 text-xs font-mono bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded">
                                    {`{{${index + 1}}}`}: {val}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


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

    const handleSaveTemplate = async (templateData: Omit<MessageTemplate, 'id' | 'status'>) => {
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
            {templates.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>
            ) : (
                 <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                    <p className="text-slate-500 dark:text-slate-400">No message templates found.</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Click "Create New Template" to get started.</p>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Message Template">
                <TemplateForm onSave={handleSaveTemplate} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Templates;