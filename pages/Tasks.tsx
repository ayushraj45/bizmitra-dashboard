
import React, { useState, useEffect } from 'react';
import { getTasks } from '../services/api';
import { Task, TaskUrgency } from '../types';

const urgencyColorMapping = {
    [TaskUrgency.LOW]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
    [TaskUrgency.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
    [TaskUrgency.HIGH]: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700',
    [TaskUrgency.CRITICAL]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-l-4 ${urgencyColorMapping[task.urgency].split(' ')[2]}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{task.title}</h3>
                {task.client && <p className="text-sm text-slate-500 dark:text-slate-400">For: {task.client}</p>}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Created: {new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${urgencyColorMapping[task.urgency]}`}>
                {task.urgency}
            </span>
        </div>
    </div>
);


const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTasksData = async () => {
            setIsLoading(true);
            try {
                const data = await getTasks();
                const urgencyOrder = [TaskUrgency.CRITICAL, TaskUrgency.HIGH, TaskUrgency.MEDIUM, TaskUrgency.LOW];
                const sortedData = data.sort((a, b) => urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency));
                setTasks(sortedData);
            } catch (error) {
                console.error("Failed to fetch tasks:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasksData();
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading tasks...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-4">
                 {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))
                ) : (
                    <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                        <p className="text-slate-500 dark:text-slate-400">No tasks found. Well done!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tasks;
