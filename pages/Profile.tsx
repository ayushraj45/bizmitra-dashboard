
import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { BusinessProfile, Timezone } from '../types';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (profile) {
            setProfile({
                ...profile,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (profile) {
            setIsSaving(true);
            try {
                await updateProfile(profile);
                // Could add a success toast/message here
            } catch (error) {
                console.error("Failed to update profile:", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading profile...</div>;
    }

    if (!profile) {
        return <div className="p-8 text-center text-red-500">Could not load profile data.</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Business Name</label>
                                <input type="text" name="businessName" id="businessName" value={profile.businessName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"/>
                            </div>
                            <div>
                                <label htmlFor="businessType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Business Type</label>
                                <input type="text" name="businessType" id="businessType" value={profile.businessType} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"/>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Email</label>
                                <input type="email" name="email" id="email" value={profile.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"/>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Phone</label>
                                <input type="tel" name="phone" id="phone" value={profile.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"/>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label htmlFor="operatingHours" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hours of Operation</label>
                                <input type="text" name="operatingHours" id="operatingHours" value={profile.operatingHours} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"/>
                            </div>
                             <div>
                                <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                                <select name="timezone" id="timezone" value={profile.timezone} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                                    <option value={Timezone.US}>US (EST)</option>
                                    <option value={Timezone.INDIA}>India (IST)</option>
                                    <option value={Timezone.EUROPE}>Europe (GMT)</option>
                                </select>
                            </div>
                         </div>
                         <div>
                            <label htmlFor="services" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Services Offered</label>
                            <textarea name="services" id="services" rows={3} value={profile.services} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" placeholder="e.g., Web Design, SEO, Social Media..."></textarea>
                         </div>
                          <div>
                            <label htmlFor="instructions" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Instructions for Chatbot</label>
                            <textarea name="instructions" id="instructions" rows={4} value={profile.instructions} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" placeholder="Provide instructions for how the AI should respond to common queries."></textarea>
                         </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-right rounded-b-xl">
                        <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
