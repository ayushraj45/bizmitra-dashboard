
import React, { useState, useEffect } from 'react';
import { getClients, addClient, updateClient } from '../services/api';
import { Client } from '../types';
import Modal from '../components/Modal';

const ClientForm: React.FC<{ client?: Client | null; onSave: (clientData: any) => void; onCancel: () => void }> = ({ client, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: client?.name || '',
        email: client?.email || '',
        phone: client?.phone_number || '',
        notes: client?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" rows={3} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">Save Client</button>
            </div>
        </form>
    );
};

const ClientCard: React.FC<{ client: Client; onEdit: (client: Client) => void }> = ({ client, onEdit }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex flex-col justify-between">
        <div>
            <div className="flex items-center space-x-4 mb-3">
                <img src={client.avatarUrl || 'https://ui-avatars.com/api/?name=No+Image'} alt={client.name} className="w-14 h-14 rounded-full" />
                <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{client.name}</h3>
                    <p className="text-sm text-primary-500 truncate overflow-hidden w-50">{client.email}</p>
                </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2"><strong>Phone:</strong> {client.phone_number}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Last Contact:</strong> {client.last_interaction_at}</p>
            {client.notes && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-md"><em>{client.notes}</em></p>}
        </div>
        <button onClick={() => onEdit(client)} className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 self-start">Edit Details</button>
    </div>
);

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const fetchClientsData = async () => {
        setIsLoading(true);
        try {
            const data = await getClients();
            console.log('Fetched clients at the page:', data);
            setClients(data.bclients); // <-- Use data.bclients instead of data
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClientsData();
    }, []);

    const handleOpenModal = (client: Client | null = null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleSaveClient = async (clientData: any) => {
        try {
            if (editingClient) {
                await updateClient({ ...editingClient, ...clientData });
            } else {
                await addClient(clientData);
            }
            await fetchClientsData();
        } catch (error) {
            console.error("Failed to save client:", error);
        } finally {
            handleCloseModal();
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading clients...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-end mb-6">
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Add New Client
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.isArray(clients) && clients.length > 0 ? (
                        clients.map(client => (
                            <ClientCard key={client.id} client={client} onEdit={handleOpenModal} />
                        ))
                    ) : (
                        // Optional: Display a loading or no clients message
                        <p>Loading clients or no clients available.</p>
                    )}
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? 'Edit Client' : 'Add New Client'}>
                <ClientForm client={editingClient} onSave={handleSaveClient} onCancel={handleCloseModal} />
            </Modal>
        </div>
    );
};

export default Clients;
