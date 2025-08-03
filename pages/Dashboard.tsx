
import React, { useState, useEffect } from 'react';
import { getDashboardSummary, getNewTasks } from '../services/api';
import { Task, TaskUrgency } from '../types';
import DashboardCard from '../components/DashboardCard';

const iconColorMapping = {
    bookings: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    tasks: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
    clients: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    revenue: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
};

const urgencyColorMapping = {
    [TaskUrgency.LOW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [TaskUrgency.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [TaskUrgency.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    [TaskUrgency.CRITICAL]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState({ upcomingBookings: 0, openTasks: 0, totalClients: 0, revenue: 0 });
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [summaryData] = await Promise.all([
                    getDashboardSummary(),
                   // getNewTasks()
                ]);
                setSummary(summaryData);
                console.log('Fetched dashboard summary:', summaryData);
                //setTasks(tasksData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);
    
    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading dashboard...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Upcoming Bookings" value={summary.upcomingBookings} color={iconColorMapping.bookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <DashboardCard title="Open Tasks" value={summary.openTasks} color={iconColorMapping.tasks} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
                <DashboardCard title="Total Clients" value={summary.totalClients} color={iconColorMapping.clients} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <DashboardCard title="Revenue (Month)" value={`$${summary.revenue.toLocaleString()}`} color={iconColorMapping.revenue} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
            </div>

            {/* New Tasks List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">New Tasks</h2>
                </div>
                <div className="p-6">
                    <ul className="space-y-4">
                        {tasks.length > 0 ? tasks.map(task => (
                             <li key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{task.description}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Created: {new Date(task.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${urgencyColorMapping[task.priority]}`}>
                                    {task.priority}
                                </span>
                            </li>
                        )) : (
                             <li className="text-center text-slate-500 dark:text-slate-400 py-4">No new tasks.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
