import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, getProfileInfo,  } from '../services/api';
import { BusinessProfile, Timezone , BusinessProfileInfo, Service} from '../types';
import WhatsAppLoginButton from '@/components/WhatsAppLoginButton';
import GoogleConnect from '@/components/GoogleConnect';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [profileInfo, setProfileInfo] = useState<BusinessProfileInfo | null>(null);  
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [businessID, setBusinessID] = useState<string | null>(null);

    useEffect(() => {
        console.log("Fetching profile data...", profile);
        const fetchProfileData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [profileData, profileInfoData] = await Promise.all([
                    getProfile(),
                    getProfileInfo()
                    
                ]);
                
                setProfileInfo(profileInfoData);

                if (profileData) {
                    console.log('Fetched profile data:', profileData);
                    setBusinessID(profileData.business_id);
                    let servicesArray: Service[] = [];
                    const rawServices = profileData.services as any;
                    if (typeof rawServices === 'string' && rawServices.trim().startsWith('[')) {
                        try {
                            const parsed = JSON.parse(rawServices);
                            servicesArray = Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            console.error("Services field is not a valid JSON array string:", rawServices);
                        }
                    } else if (Array.isArray(rawServices)) {
                        servicesArray = rawServices;
                    }
                    setProfile({ ...profileData, services: servicesArray });
                } else {
                    // Handle case where profileData might be null from API
                    setProfile(null);
                }

            } catch (error: any) {
                console.error("Failed to fetch profile data:", error);
                setError('Could not load profile data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (profile) {
            setProfile({ ...profile, [e.target.name]: e.target.value });
        }
    };
    
    const handleProfileInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if(profileInfo) {
            setProfileInfo({ ...profileInfo, [e.target.name]: e.target.value });
        }
    };

    const handleServiceChange = (index: number, field: keyof Service, value: string) => {
        if (profile) {
            const updatedServices = [...profile.services];
            updatedServices[index] = { ...updatedServices[index], [field]: value };
            setProfile({ ...profile, services: updatedServices });
        }
    };

    const handleAddService = () => {
        if (profile) {
            const newService: Service = { name: '', price: '', time: '' };
            setProfile({ ...profile, services: [...profile.services, newService] });
        }
    };

    const handleRemoveService = (index: number) => {
        if (profile) {
            const updatedServices = profile.services.filter((_, i) => i !== index);
            setProfile({ ...profile, services: updatedServices });
        }
    };

    const handleSaveChanges = async () => {
        if (!profile) return;

        setIsSaving(true);
        setError('');
        try {
            const updatePromises: Promise<any>[] = [];
            
            if (profile) {
                 const payload = {
                    ...profile,
                    services: profile.services.map(s => ({
                        ...s,
                        price: parseFloat(s.price as string) || 0
                    }))
                };
                updatePromises.push(updateProfile(payload as any));
            }
             
            alert("Profile saved successfully!");

        } catch (error) {
            console.error("Failed to save profile:", error);
            setError("Failed to save profile. Please check your connection and try again.");
            alert("Failed to save profile. Please check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading profile...</div>;
    }

    if (error && !profile && !profileInfo) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }
    
    if (!profile || !profileInfo) {
         return <div className="p-8 text-center text-slate-500 dark:text-slate-400">No profile data found. You may need to complete initial setup.</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Card 1: Business Information */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Business Information</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Core details for your business account.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Business Name</label>
                                <input type="text" name="name" id="businessName" value={profileInfo.name} onChange={handleProfileInfoChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500"/>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Email</label>
                                <input type="email" name="email" id="email" value={profileInfo.email} disabled className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed"/>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Phone</label>
                                <input type="tel" name="phone_number" id="phone" value={profileInfo.phone_number} disabled className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed"/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Chatbot Profile & Behavior */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Chatbot Profile & Behavior</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Configure how your AI assistant interacts and what it knows.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="businessType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Business Type</label>
                                <input type="text" name="business_type" id="businessType" value={profile.business_type} onChange={handleProfileChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., Freelance Photographer"/>
                            </div>
                            <div>
                                <label htmlFor="tone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tone of Voice</label>
                                <input type="text" name="tone" id="tone" value={profile.tone} onChange={handleProfileChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., Friendly & Professional"/>
                            </div>
                            <div>
                                <label htmlFor="hours_of_operation" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Hours of Operation</label>
                                <input type="text" name="hours_of_operation" id="hours_of_operation" value={profile.hours_of_operation} onChange={handleProfileChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., Mon-Fri, 9am - 5pm"/>
                            </div>
                            <div>
                                <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                                <select name="timezone" id="timezone" value={profile.timezone} onChange={handleProfileChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500">
                                    <option value={Timezone.US}>US (EST)</option>
                                    <option value={Timezone.INDIA}>India (IST)</option>
                                    <option value={Timezone.EUROPE}>Europe (GMT)</option>
                                </select>
                            </div>
                        </div>

                         <div>
                            <label htmlFor="about" className="block text-sm font-medium text-slate-700 dark:text-slate-300">About Your Business</label>
                            <textarea name="about" id="about" rows={3} value={profile.about} onChange={handleProfileChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500" placeholder="Give a brief description of your business for the chatbot."></textarea>
                        </div>
                        
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Services Offered</label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Provide a list of services the chatbot should know about.</p>
                            <div className="space-y-3">
                                {profile.services.map((service, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-900/70 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-grow">
                                            <input type="text" placeholder="Service Name" value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500"/>
                                            <input type="number" placeholder="Price" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500"/>
                                            <input type="text" placeholder="Time (e.g., 45 mins)" value={service.time} onChange={(e) => handleServiceChange(index, 'time', e.target.value)} className="w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500"/>
                                        </div>
                                        <button onClick={() => handleRemoveService(index)} type="button" className="p-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900">
                                            <span className="sr-only">Remove Service</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button onClick={handleAddService} type="button" className="flex items-center space-x-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 pt-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    <span>Add Service</span>
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="instructions" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Instructions for Chatbot</label>
                            <textarea name="instructions" id="instructions" rows={4} value={profile.instructions} onChange={handleProfileChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500" placeholder="Provide instructions for how the AI should respond."></textarea>
                        </div>
                    </div>
                </div>

                {/* Integrations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                         <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">WhatsApp Connection</h2>
                         <div className="flex items-center justify-between mt-4">
                             <p className="text-slate-600 dark:text-slate-300 text-sm">Connect your WhatsApp Business account to enable the chatbot.</p>
                             {/* <button className="px-4 py-2 font-semibold bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Connect
                             </button> */}
                             <WhatsAppLoginButton />
                         </div>
                     </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                         <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Google Calendar Sync</h2>
                         <div className="flex items-center justify-between mt-4">
                             <p className="text-slate-600 dark:text-slate-300 text-sm">Connect your Google Calendar for automated booking management.</p>
                             {/* <button onClick={getGoogleAuthUrl} className="px-4 py-2 font-semibold bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Connect
                             </button> */}
                            <GoogleConnect
                            onSuccess={() => console.log('Connected!')} 
                            onError={(error) => console.error(error)} 
                            businessID={businessID as string}
                            />
                         </div>
                     </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2 pb-8">
                     <button onClick={handleSaveChanges} disabled={isSaving} className="inline-flex justify-center py-2 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300">
                        {isSaving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;