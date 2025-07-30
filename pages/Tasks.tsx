
import React, { useState, useEffect, useMemo } from 'react';
import { getTasks, updateTask } from '../services/api';
import { Task, TaskUrgency } from '../types';

const urgencyColorMapping = {
    [TaskUrgency.LOW]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
    [TaskUrgency.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
    [TaskUrgency.HIGH]: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700',
    [TaskUrgency.CRITICAL]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
};

const TaskCard: React.FC<{ task: Task; onToggleStatus: (taskId: string) => void; }> = ({ task, onToggleStatus }) => {
    const isCompleted = task.status === 'resolved';

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-l-4 transition-all duration-300 ${urgencyColorMapping[task.priority].split(' ')[2]} ${isCompleted ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4 flex-grow">
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => onToggleStatus(task.id)}
                        aria-label={`Mark task ${task.description} as ${isCompleted ? 'pending' : 'completed'}`}
                        className="form-checkbox h-6 w-6 mt-1 flex-shrink-0 rounded text-primary-600 focus:ring-primary-500 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 checked:bg-primary-600 cursor-pointer"
                    />
                    <div>
                        <h3 className={`font-bold text-lg text-slate-800 dark:text-slate-100 transition-all ${isCompleted ? 'line-through' : ''}`}>{task.description}</h3>
                        {task.client_name && <p className="text-sm text-slate-500 dark:text-slate-400">For: {task.client_name}</p>}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Created: {new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ml-4 flex-shrink-0 ${urgencyColorMapping[task.priority]}`}>
                    {task.priority}
                </span>
            </div>
        </div>
    );
};


const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTasksData = async () => {
            setIsLoading(true);
            try {
                const data = await getTasks();
                // Ensure every task has a status, default to 'pending'
                const tasksWithStatus = data.btasks.map(task => ({ ...task, status: task.status || 'pending' }));
                setTasks(tasksWithStatus);
            } catch (error) {
                console.error("Failed to fetch tasks:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasksData();
    }, []);

    const handleToggleStatus = async (taskId: string) => {
        const originalTasks = [...tasks];
        let updatedTask: Task | undefined;

        const newTasks = tasks.map(task => {
            if (task.id === taskId) {
                updatedTask = { ...task, status: task.status === 'resolved' ? 'in_progress' : 'resolved' };
                return updatedTask;
            }
            return task;
        });

        setTasks(newTasks); // Optimistic UI update

        try {
            if (updatedTask) {
                await updateTask(updatedTask);
            }
        } catch (error) {
            console.error("Failed to update task status:", error);
            setTasks(originalTasks); // Revert on error
        }
    };
    
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            if (a.status === 'resolved' && b.status !== 'resolved') return 1;
            if (a.status !== 'resolved' && b.status === 'resolved') return -1;

            const urgencyOrder = [TaskUrgency.CRITICAL, TaskUrgency.HIGH, TaskUrgency.MEDIUM, TaskUrgency.LOW];
            return urgencyOrder.indexOf(a.priority) - urgencyOrder.indexOf(b.priority);
        });
    }, [tasks]);

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading tasks...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-4">
                 {sortedTasks.length > 0 ? (
                    sortedTasks.map(task => (
                        <TaskCard key={task.id} task={task} onToggleStatus={handleToggleStatus} />
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