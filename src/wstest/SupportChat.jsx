import React, { useState, useEffect } from 'react';

const SupportChat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        setMessages([...messages, { text: newMessage, sender: 'user', time: new Date() }]);
        setNewMessage('');

        // Simulate response (replace with actual backend integration)
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: "Thanks for your message. Our support team will get back to you soon.",
                sender: 'support',
                time: new Date()
            }]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-blue-600 text-white p-4">
                <h1 className="text-xl font-bold">Support Chat</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                    >
                        <div className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                            }`}>
                            {msg.text}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {msg.time.toLocaleTimeString()}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
                <div className="flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupportChat; 