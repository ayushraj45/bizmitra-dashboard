import React, { useState } from 'react';

const faqData = [
    {
        question: 'How to connect my WhatsApp for Business to BizMitra?',
        answer: 'Navigate to the "Profile" page from the sidebar. You will find a "WhatsApp Connection" card. Click the "Connect" button and follow the on-screen instructions to securely link your WhatsApp Business account through Meta\'s official authentication process.'
    },
    {
        question: 'How to connect my Google Calendar to BizMitra?',
        answer: 'On the "Profile" page, locate the "Google Calendar Sync" card. Click the "Connect" button and you will be prompted to sign in with your Google account and grant the necessary permissions. This allows BizMitra to manage your bookings automatically.'
    },
    {
        question: 'Why do I need to add payment details to connect WhatsApp?',
        answer: 'This is a requirement from Meta (Facebook) for using the WhatsApp Business Platform. While Meta charges businesses for sending certain types of messages, they do not charge for replying to customer-initiated conversations within a 24-hour window. Since BizMitra only *responds* to messages, you are unlikely to incur charges from WhatsApp. BizMitra does not store or have access to your payment information; it is handled securely by Meta.'
    },
    {
        question: 'How to customize my BizMitra?',
        answer: 'Customizing your BizMitra assistant is easy and crucial for its performance! Go to the "Profile" page. Here you can fill out your business details, list your services with prices, set your hours of operation, and most importantly, provide specific instructions and a tone of voice for the chatbot. The more detailed and clear you are, the more accurately it will represent your business.'
    },
    {
        question: 'Best practices for BizMitra customization',
        answer: (
            <div className="space-y-3">
                <p>To get the best results, provide as much high-quality information as possible in your profile:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>
                        <strong>About the Business:</strong> Be descriptive. Instead of "We sell cakes," try "We are a boutique bakery specializing in custom-designed cakes for weddings and special events, using only organic, locally-sourced ingredients."
                    </li>
                    <li>
                        <strong>Services Offered:</strong> Be specific. Include names, prices, and other relevant details like duration (e.g., "60-minute Financial Consultation - $150"). This helps the AI answer pricing questions directly.
                    </li>
                    <li>
                        <strong>Instructions for Chatbot:</strong> This is the most critical field. Give the AI a persona ("Act as a friendly and helpful shop assistant named 'Alex'"). Set clear boundaries ("Do not offer discounts unless a customer asks for a bulk order"). Provide specific examples ("If a customer asks about vegan options, respond with: 'We have a delicious vegan chocolate avocado mousse cake!'").
                    </li>
                     <li>
                        <strong>Tone of Voice:</strong> Be explicit. Instead of just "Friendly," try "Warm, slightly informal, and enthusiastic, using emojis where appropriate." This ensures the AI's personality matches your brand identity.
                    </li>
                </ul>
            </div>
        )
    }
];

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-200 dark:border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-2"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">{title}</h3>
                <svg
                    className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded-b-lg">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Help: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* QR Code Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">QR Code</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Talk to BizMitra on WhatsApp</h2>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">Have a question about our service? Scan this code with your phone's camera to start a chat with our own AI assistant.</p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                     <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions</h2>
                    </div>
                    <div className="px-6">
                        {faqData.map((faq, index) => (
                            <AccordionItem key={index} title={faq.question}>
                                {faq.answer}
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
