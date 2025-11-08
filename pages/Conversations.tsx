import React, { useState, useEffect, useMemo } from 'react';
import { getChats, getChatMessages } from '../services/api';
import { Chat, ChatMessage } from '../types';

const Conversations: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchChats = async () => {
            setIsLoadingChats(true);
            setError(null);
            try {
                const chatsData = await getChats();
                console.log('Fetched chats at the page:', chatsData);
                // API may return either an array or an object like { chats: [...] }.
                const chatsArray: Chat[] = Array.isArray(chatsData)
                    ? (chatsData as Chat[])
                    : Array.isArray((chatsData as any)?.chats)
                        ? ((chatsData as any).chats as Chat[])
                        : [];
                const sortedChats = chatsArray.sort((a: Chat, b: Chat) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setChats(sortedChats);
            } catch (err) {
                console.error("Failed to fetch chats:", err);
                setError("Could not load conversations.");
            } finally {
                setIsLoadingChats(false);
            }
        };
        fetchChats();
    }, []);

    useEffect(() => {
        if (!selectedChat) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            setError(null);
            try {
                const messagesData = await getChatMessages(selectedChat.id);
                const messagesArray: ChatMessage[] = Array.isArray(messagesData)
                    ? (messagesData as ChatMessage[])
                    : Array.isArray((messagesData as any)?.messages)
                        ? ((messagesData as any).messages as ChatMessage[])
                        : [];
                const sortedMessages = messagesArray.sort((a: ChatMessage, b: ChatMessage) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                setMessages(sortedMessages);
            } catch (err) {
                console.error(`Failed to fetch messages for chat ${selectedChat.id}:`, err);
                setError(`Could not load messages for ${selectedChat.BClient.name}.`);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedChat]);

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(chat);
    };

    const handleDeleteChat = async (e: React.MouseEvent, chatIdToDelete: string) => {
        e.stopPropagation(); // Prevent the parent li's onClick from firing
        if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            const originalChats = [...chats];
            // Optimistic UI update
            setChats(currentChats => currentChats.filter(chat => chat.id !== chatIdToDelete));
            if (selectedChat?.id === chatIdToDelete) {
                setSelectedChat(null);
            }

            try {
                // TODO: Add a `deleteChat` function to `services/api.ts` and uncomment the line below.
                // await deleteChat(chatIdToDelete);
            } catch (err) {
                console.error("Failed to delete chat:", err);
                setError("Could not delete conversation. Please try again.");
                setChats(originalChats); // Revert on failure
            }
        }
    };

    const filteredChats = useMemo(() => {
        if (!searchTerm) {
            return chats;
        }
        return chats.filter(chat =>
            chat.metadata?.source?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [chats, searchTerm]);

    return (
        <div className="flex h-full bg-slate-100 dark:bg-slate-900">
            {/* Chat List Pane */}
            <aside className={`w-full md:w-1/3 lg:w-1/4 h-full flex flex-col overflow-y-auto bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Conversations</h2>
                     <div className="relative mt-4">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by source..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoadingChats ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>
                    ) : error && chats.length === 0 ? (
                         <div className="p-8 text-center text-red-500">{error}</div>
                    ) : (
                        <ul>
                            {filteredChats.map(chat => (
                                <li key={chat.id} onClick={() => handleSelectChat(chat)} className={`flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedChat?.id === chat.id ? 'bg-primary-50 dark:bg-slate-700' : ''}`}>
                                    <div className="flex-grow truncate">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{chat.BClient.name}</p>
                                            <time className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">{new Date(chat.last_message_timestamp).toLocaleDateString()}</time>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{chat.BClient.email}</p>
                                        {chat.metadata?.source && (
                                            <span className="mt-2 inline-block px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-full">{chat.metadata.source}</span>
                                        )}
                                    </div>
                                     <button 
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        className="ml-4 p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 flex-shrink-0"
                                        aria-label="Delete conversation"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>

            {/* Message Pane */}
            <main className={`flex-1 flex flex-col h-full ${selectedChat ? 'block' : 'hidden md:flex'}`}>
                {selectedChat ? (
                    <>
                        <header className="flex items-center p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <button onClick={() => setSelectedChat(null)} className="md:hidden mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{selectedChat.BClient.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{selectedChat.status}</p>
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {isLoadingMessages ? (
                                <div className="text-center text-slate-500 dark:text-slate-400">Loading messages...</div>
                            ) : error && messages.length === 0 ? (
                                <div className="text-center text-red-500">{error}</div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_type === 'client' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-lg p-3 rounded-xl ${msg.sender_type === 'client' ? 'bg-white dark:bg-slate-700' : 'bg-primary-500 text-white'}`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${msg.sender_type === 'client' ? 'text-slate-400 dark:text-slate-500' : 'text-primary-200'} text-right`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <h2 className="text-xl font-medium">Select a conversation</h2>
                        <p>Choose a chat from the left panel to view messages.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Conversations;
