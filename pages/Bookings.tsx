
import React, { useState, useEffect } from 'react';
import { getBookings } from '../services/api';
import { Booking } from '../types';

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const isUpcoming = booking.status === 'Upcoming';
    const cardClass = isUpcoming 
        ? 'border-l-4 border-blue-500' 
        : 'border-l-4 border-slate-400 dark:border-slate-600 opacity-70';

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex justify-between items-center ${cardClass}`}>
            <div>
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{booking.service}</p>
                <p className="text-slate-600 dark:text-slate-300">with {booking.clientName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(booking.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
            </div>
            <div className={`px-3 py-1 text-sm font-semibold rounded-full ${
                isUpcoming ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
            }`}>
                {booking.status}
            </div>
        </div>
    );
};

const Bookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookingsData = async () => {
            setIsLoading(true);
            try {
                const data = await getBookings();
                // Sort bookings with upcoming first, then by date
                const sortedData = data.sort((a, b) => {
                    if (a.status === 'Upcoming' && b.status !== 'Upcoming') return -1;
                    if (a.status !== 'Upcoming' && b.status === 'Upcoming') return 1;
                    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
                });
                setBookings(sortedData);
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookingsData();
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading bookings...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-4">
                {bookings.length > 0 ? (
                    bookings.map(booking => (
                        <BookingCard key={booking.id} booking={booking} />
                    ))
                ) : (
                    <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                        <p className="text-slate-500 dark:text-slate-400">No bookings found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookings;
