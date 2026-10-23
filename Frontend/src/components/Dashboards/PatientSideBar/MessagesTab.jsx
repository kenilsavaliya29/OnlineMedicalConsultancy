import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../../contexts/chatContext.jsx';
import { AuthContext } from '../../../contexts/authContext';
import { useContext } from 'react';

const MessagesTab = () => {
    const { user } = useContext(AuthContext);

    const {
        isConnected,
        currentAppointment,
        messages,
        typingUsers,
        chatAppointments,
        isLoading,
        fetchChatAppointments,
        joinAppointment,
        leaveAppointment,
        sendMessage,
        markMessagesAsRead,
        startTyping,
        stopTyping,
        checkChatAvailability,
    } = useChat();

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [chatAvailable, setChatAvailable] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        fetchChatAppointments();
    }, [fetchChatAppointments]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages]);

    useEffect(() => {
        if (currentAppointment && messages.length > 0) {
            markMessagesAsRead();
        }
    }, [currentAppointment, messages.length, markMessagesAsRead]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const activeAppointments = chatAppointments.filter(
        (appointment) => appointment.status === '0'
    );

    const getOtherPerson = (appointment) => {
        if (user?.role === 'doctor') {
            return appointment.patientId;
        }

        return appointment.doctorId;
    };

    const getOtherPersonName = (appointment) => {
        const person = getOtherPerson(appointment);

        if (person?.fullName) return person.fullName;

        const name = [
            person?.firstName,
            person?.lastName,
        ].filter(Boolean).join(' ');

        return name || (
            user?.role === 'doctor'
                ? 'Patient'
                : 'Doctor'
        );
    };

    const formatDate = (dateTime) => {
        if (!dateTime) return 'Date unavailable';

        const date = new Date(dateTime);

        if (Number.isNaN(date.getTime())) {
            return 'Invalid date';
        }

        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
        });
    };

    const handleSelectAppointment = async (appointment) => {
        if (selectedAppointment?._id === appointment._id) return;

        setError('');
        setMessageText('');
        setChatAvailable(false);
        setAvailabilityLoading(true);

        if (currentAppointment) {
            leaveAppointment();
        }

        setSelectedAppointment(appointment);

        try {
            const availability = await checkChatAvailability(
                appointment._id
            );

            const available = availability?.chatAvailable === true;

            setChatAvailable(available);

            // Load history and attempt to join the real-time room.
            // The server independently validates room access.
            joinAppointment(appointment._id);
        } catch (err) {
            setError('Unable to open this conversation.');
        } finally {
            setAvailabilityLoading(false);
        }
    };

    const handleSendMessage = (event) => {
        event.preventDefault();

        const trimmedMessage = messageText.trim();

        if (
            !trimmedMessage ||
            !selectedAppointment ||
            !chatAvailable ||
            !isConnected ||
            sending
        ) {
            return;
        }

        setSending(true);
        setError('');

        try {
            sendMessage(trimmedMessage);
            setMessageText('');
            stopTyping();
        } catch (err) {
            setError('Unable to send the message.');
        } finally {
            setSending(false);
        }
    };

    const handleMessageChange = (event) => {
        setMessageText(event.target.value);

        if (event.target.value.trim()) {
            startTyping();

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                stopTyping();
            }, 1200);
        } else {
            stopTyping();
        }
    };

    const getSenderId = (message) => {
        const sender = message.senderId;
        return String(sender?._id || sender || '');
    };

    const isOwnMessage = (message) => {
        return getSenderId(message) === String(user?._id);
    };

    const isSomeoneTyping = [...typingUsers].some(
        (id) => String(id) !== String(user?._id)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Messages
                    </h2>
                    <p className="text-sm text-gray-500">
                        {user?.role === 'doctor'
                            ? 'Chat with your patients'
                            : 'Chat with your doctors'}
                    </p>
                </div>

                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {isConnected ? '● Connected' : '● Disconnected'}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
                {/* Appointment sidebar */}
                <aside className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold">
                            Conversations
                        </h3>
                        <p className="text-sm text-gray-500">
                            Select an appointment
                        </p>
                    </div>

                    <div className="overflow-y-auto h-[calc(70vh-4rem)]">
                        {isLoading ? (
                            <p className="p-4 text-gray-500">
                                Loading appointments...
                            </p>
                        ) : activeAppointments.length === 0 ? (
                            <p className="p-4 text-center text-gray-500">
                                No confirmed appointments found.
                            </p>
                        ) : (
                            activeAppointments.map((appointment) => (
                                <button
                                    type="button"
                                    key={appointment._id}
                                    onClick={() =>
                                        handleSelectAppointment(appointment)
                                    }
                                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 ${selectedAppointment?._id === appointment._id
                                        ? 'bg-[#007E85]/5 border-l-4 border-l-[#007E85]'
                                        : ''
                                        }`}
                                >
                                    <p className="font-medium truncate text-gray-800">
                                        {getOtherPersonName(appointment)}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatDate(appointment.dateTime)}
                                    </p>

                                    <span className="inline-block mt-2 text-xs rounded-full px-2 py-1 bg-green-100 text-green-800">
                                        Confirmed
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                {/* Chat panel */}
                <section className="lg:col-span-3 h-full min-h-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    {!selectedAppointment ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500 p-6">
                            Select an appointment to open your conversation.
                        </div>
                    ) : (
                        <>
                            <header className="p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">
                                    {getOtherPersonName(selectedAppointment)}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {formatDate(selectedAppointment.dateTime)}
                                </p>
                            </header>

                            <div
                                ref={messagesContainerRef}
                                className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gray-50"
                            >
                                {availabilityLoading ? (
                                    <p className="text-center text-gray-500">
                                        Checking chat availability...
                                    </p>
                                ) : messages.length === 0 ? (
                                    <p className="text-center text-gray-500 mt-8">
                                        No messages yet. Start the conversation.
                                    </p>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message._id}
                                            className={`flex ${isOwnMessage(message)
                                                ? 'justify-end'
                                                : 'justify-start'
                                                }`}
                                        >
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isOwnMessage(message)
                                                ? 'bg-[#007E85] text-white'
                                                : 'bg-white border border-gray-200 text-gray-800'
                                                }`}>
                                                <p className="whitespace-pre-wrap break-words">
                                                    {message.message}
                                                </p>

                                                <div className={`flex gap-2 justify-end items-center mt-1 text-xs ${isOwnMessage(message)
                                                    ? 'text-white/75'
                                                    : 'text-gray-400'
                                                    }`}>
                                                    <span>
                                                        {message.createdAt
                                                            ? new Date(message.createdAt).toLocaleTimeString(
                                                                'en-IN',
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    timeZone: 'Asia/Kolkata',
                                                                }
                                                            )
                                                            : ''}
                                                    </span>

                                                    {isOwnMessage(message) && (
                                                        <span>
                                                            {message.status === 'read'
                                                                ? '✓✓ Read'
                                                                : message.status === 'delivered'
                                                                    ? '✓✓ Delivered'
                                                                    : '✓ Sent'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {isSomeoneTyping && (
                                    <p className="text-sm text-gray-500 italic">
                                        {getOtherPersonName(selectedAppointment)} is typing...
                                    </p>
                                )}

                            </div>

                            {error && (
                                <p className="px-4 pt-2 text-sm text-red-600">
                                    {error}
                                </p>
                            )}

                            {!isConnected ? (
                                <p className="p-3 text-center text-sm text-red-600 border-t">
                                    Reconnecting to chat server...
                                </p>
                            ) : !chatAvailable && !availabilityLoading ? (
                                <p className="p-3 text-center text-sm text-amber-700 bg-amber-50 border-t">
                                    Chat is currently outside the allowed appointment window.
                                </p>
                            ) : (
                                <form
                                    onSubmit={handleSendMessage}
                                    className="p-3 border-t border-gray-200 flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={messageText}
                                        onChange={handleMessageChange}
                                        maxLength={1000}
                                        placeholder="Type a message..."
                                        className="flex-1 min-w-0 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                                    />

                                    <button
                                        type="submit"
                                        disabled={
                                            !messageText.trim() ||
                                            sending ||
                                            !isConnected
                                        }
                                        className="bg-[#007E85] text-white px-5 py-2 rounded-full hover:bg-[#00666b] disabled:opacity-50"
                                    >
                                        Send
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MessagesTab;
