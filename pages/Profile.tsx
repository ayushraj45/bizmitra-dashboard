import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, getProfileInfo, getApiKey, getConnectors, fetchWebsiteContent } from '../services/api';
import { BusinessProfile, Timezone , BusinessProfileInfo, Service, Connectors} from '../types';
import WhatsAppLoginButton from '@/components/WhatsAppLoginButton';
import GoogleConnect from '@/components/GoogleConnect';

const ProfileCard: React.FC<{ title: string; children: React.ReactNode; footer?: React.ReactNode; }> = ({ title, children, footer }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
        {footer && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-right rounded-b-xl">
                {footer}
            </div>
        )}
    </div>
);


const Profile: React.FC = () => {
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [profileInfo, setProfileInfo] = useState<BusinessProfileInfo | null>(null);  
    const [connectors, setConnectors] = useState<Connectors>({ WAConnection: false, GoogleConnection: false });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [businessID, setBusinessID] = useState<string | null>(null);

    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
    const [brandColor, setBrandColor] = useState('#3b82f6'); // Default to primary color
    const [isGeneratingKey, setIsGeneratingKey] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const [websiteUrl, setWebsiteUrl] = useState('');
    const [isFetchingWebsite, setIsFetchingWebsite] = useState(false);

    useEffect(() => {
        console.log("Fetching profile data...", profile);
        const fetchProfileData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [profileData, profileInfoData, connectorsData] = await Promise.all([
                    getProfile(),
                    getProfileInfo(),
                    getConnectors()
                ]);
                
                setProfileInfo(profileInfoData);
                setConnectors(connectorsData);
                console.log('connectorsData: ', connectorsData) 
                console.log('connectors: ', connectors)

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

const handleFetchWebsite = async () => {
    if (!websiteUrl) return;
    
    setIsFetchingWebsite(true);

    // --- START: URL Normalization Logic ---
    let formattedUrl = websiteUrl.trim();

    // 1. Add https:// if no protocol is present
    if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
    }

    // 2. Use the URL constructor to validate and normalize (adds trailing '/' if needed)
    try {
        const urlObj = new URL(formattedUrl);
        formattedUrl = urlObj.href; 
    } catch (e) {
        console.error("Invalid URL format", e);
        alert("Please enter a valid URL.");
        setIsFetchingWebsite(false);
        return;
    }
    // --- END: URL Normalization Logic ---

    try {
        // Use formattedUrl here instead of websiteUrl
        const { content } = await fetchWebsiteContent(formattedUrl);
        
        if (profile) {
            const currentAbout = profile.about || '';
            const separator = currentAbout ? '\n\n' : '';
            setProfile({ ...profile, about: currentAbout + separator + content });
        }
    } catch (err) {
        console.error("Failed to fetch website content:", err);
        alert("Failed to fetch website content.");
    } finally {
        setIsFetchingWebsite(false);
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

     const handleGenerateKey = async () => {
        console.log("Generating API key...");
        setIsGeneratingKey(true);
        try {
            const { apiKey: newApiKey } = await getApiKey();
            console.log("Generated API key:", newApiKey);
            setApiKey(newApiKey);
        } catch (error) {
            console.error("Failed to generate API key:", error);
        } finally {
            setIsGeneratingKey(false);
        }
    };

    const codeSnippet = `
        <script>
        window.bizmitraConfig = {
            apiKey: '${apiKey || 'YOUR_API_KEY'}',
            businessName: '${profileInfo?.name || 'Your business name'}',
            headerColor: '${brandColor}'
        };
        </script>
        <script src="https://widget.bizmitra-ai.com/bizmitra-widget2.js"></script>
        `.trim();

    const handleCopyCode = () => {
        navigator.clipboard.writeText(codeSnippet);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    };
    
    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading profile...</div>;
    }

    if (!profile || !profileInfo) {
        return <div className="p-8 text-center text-red-500">Could not load profile data.</div>;
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
                            <label htmlFor="websiteFetch" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fetch From Website</label>
                            <div className="flex space-x-2">
                                <input 
                                    type="url" 
                                    id="websiteFetch" 
                                    placeholder="https://yourbusiness.com" 
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    className="flex-grow rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 px-3 py-2 border"
                                />
                                <button 
                                    type="button" 
                                    onClick={handleFetchWebsite}
                                    disabled={isFetchingWebsite || !websiteUrl}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 dark:disabled:bg-primary-800"
                                >
                                    {isFetchingWebsite ? 'Fetching...' : 'Fetch and Append'}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Beta: Enter your website URL to automatically extract business details and append them below. Please review generated information thoroughly, feature may not work with all websites.</p>
                        </div>

                         <div>
                            <label htmlFor="about" className="block text-sm font-medium text-slate-700 dark:text-slate-300">About Your Business/ Services/ FAQs</label>
                            <textarea name="about" id="about" rows={3} value={profile.about} onChange={handleProfileChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500" placeholder="Give a brief description of your business for the chatbot."></textarea>
                        </div>
                        
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Sessions Offered</label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Provide a list of sessions the chatbot should know about to book appointments. These would include a duration and price which can be '0' or free.</p>
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
                         <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">                            
                            {connectors.WAConnection ? 'WhatsApp Connection - Connected' : 'WhatsApp Connection'}
                         </h2>
                         <div className="flex items-center justify-between mt-4">
                             <p className="text-slate-600 dark:text-slate-300 text-sm">Connect your WhatsApp Business account to enable the chatbot.</p>
                             {/* <button className="px-4 py-2 font-semibold bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Connect
                             </button> */}
                             <WhatsAppLoginButton />
                             {/* {!connectors.WAConnection && <WhatsAppLoginButton />}
                             {connectors.WAConnection && (
                                 <span className="px-4 py-2 font-semibold text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800">
                                     Active
                                 </span>
                             )} */}
                         </div>
                     </div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                         <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                {connectors.GoogleConnection ? 'Google Calendar Sync - Connected' : 'Google Calendar Sync'}
                         </h2>                            
                         <div className="flex items-center justify-between mt-4">
                             <p className="text-slate-600 dark:text-slate-300 text-sm">Connect your Google Calendar for automated booking management.</p>
                             {/* <button onClick={getGoogleAuthUrl} className="px-4 py-2 font-semibold bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Connect
                             </button> */}
                             {/* {!connectors.GoogleConnection && ( */}
                            <GoogleConnect
                            onSuccess={() => setConnectors({ ...connectors, GoogleConnection: true })} 
                            onError={(error) => console.error(error)} 
                            businessID={businessID as string}
                            />
                            {/* )} */}
                            {/* {connectors.GoogleConnection && (
                                <span className="px-4 py-2 font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                                    Active
                                </span>
                            )} */}
                         </div>
                     </div>
                </div>

                                {/* Website Integration */}
                <ProfileCard title="Add to Website">
                    {!apiKey ? (
                         <div className="flex items-center justify-between">
                            <p className="text-slate-600 dark:text-slate-300">Generate an API Key to connect your website widget.</p>
                            <button onClick={handleGenerateKey} disabled={isGeneratingKey} className="px-4 py-2 font-semibold bg-slate-500 text-white rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50">
                                {isGeneratingKey ? 'Generating...' : 'Generate API Key'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Your API Key</label>
                                <div className="relative mt-1">
                                    <input
                                        type={isApiKeyVisible ? 'text' : 'password'}
                                        id="apiKey"
                                        readOnly
                                        value={apiKey}
                                        className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed pr-10"
                                    />
                                    <button onClick={() => setIsApiKeyVisible(!isApiKeyVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                        {isApiKeyVisible ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.118 3.526-5.449 6.837-6.108M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.75 4.75l14.5 14.5" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="brandColor" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Widget Header Color</label>
                                <input type="color" id="brandColor" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="mt-1 h-10 w-full block rounded-md border-slate-300 dark:border-slate-600 cursor-pointer" />
                            </div>
                            <div>
                                <p className="block text-sm text-slate-700 dark:text-slate-300">To integrate the widget into your website, add the following code snippet just before the closing &lt;/body&gt; tag.</p>
                                <div className="relative mt-2">
                                    <button onClick={handleCopyCode} className="absolute top-2 right-2 px-3 py-1 text-xs font-medium rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 z-10">
                                        {isCopied ? 'Copied!' : 'Copy code'}
                                    </button>
                                    <pre className="bg-slate-100 dark:bg-slate-900 rounded-md p-4 pt-10 overflow-x-auto">
                                        <code className="text-sm text-slate-800 dark:text-slate-200">{codeSnippet}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </ProfileCard>

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