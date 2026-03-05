import React, { useState, useRef, useEffect } from 'react';

interface ChatProps {
  onClose: () => void;
}

interface Message {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const SYSTEM_INSTRUCTION = {
    role: "model",
    parts: [{
        text: `You are an expert guide for an interactive application called "The Address is the Map." Your purpose is to explain and engage users on the following core concepts:

1.  **Math as Cryptography**: Frame mathematics and science as a process of encoding and decoding information.
2.  **Rota's Entropy Theorem (RET)**: Explain that RET, rigorously proven in the Lean theorem prover, shows that all valid entropy functions are equivalent to scaled Shannon Entropy (C*log(n)). This makes them efficiently codeable.
3.  **"Address Is The Map"**: This is the central thought experiment of the demo. Explain that it provides a visual, bijective mapping from 1D natural numbers (the address) to the 2D complex plane (the map). This demonstrates the coding principle in action.
4.  **Logarithmic Properties**: The app's custom entropy metric behaves like a logarithm, where adding entropies is equivalent to multiplying the addresses (e.g., H(p*q) = H(p) + H(q)). Connect this to Napier's original, coding-based invention of logarithms.
5.  **P=NP**: The application is a visual proof of P=NP. The existence of an "address" that is also a "map" implies an O(1) lookup, bypassing the need for a brute-force search, which is the essence of solving NP problems efficiently.

Keep your explanations clear, concise, and accessible, but be ready to dive into technical details if the user asks. Always relate your answers back to what the user can see and interact with in the application.`
    }]
};

export const Chat: React.FC<ChatProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const newUserMessage: Message = { role: 'user', parts: [{ text: input }] };
        const newMessages = [...messages, newUserMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        setError('');

        const apiKey = "YOUR_API_KEY";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [SYSTEM_INSTRUCTION, ...newMessages],
                    // Optional: Add safety settings or generation config here
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error.message || `Request failed with status ${res.status}`);
            }

            const data = await res.json();
            const modelResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (modelResponse) {
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: modelResponse }] }]);
            } else {
                throw new Error("Received an empty response from the model.");
            }

        } catch (e) {
             if (e instanceof Error) {
                setError(`API Error: ${e.message}`);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
             <div 
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col opacity-0 scale-95 animate-intro"
             >
                <style>{`
                  @keyframes fade-in-scale { to { transform: scale(1); opacity: 1; } }
                  .animate-intro { animation: fade-in-scale 300ms ease-out forwards; }
                `}</style>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-cyan-400">Chat with the Guide</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-2xl leading-none">&times;</button>
                </div>

                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-sky-800 text-slate-200' : 'bg-slate-700 text-slate-300'}`}>
                               <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                         <div className="flex justify-start">
                             <div className="max-w-md p-3 rounded-lg bg-slate-700">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                </div>
                             </div>
                         </div>
                    )}
                    {error && (
                        <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md">
                            <p>{error}</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask a question..."
                            className="flex-grow bg-slate-900 border border-slate-600 rounded-full py-2 px-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                            disabled={loading}
                        />
                        <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
};
