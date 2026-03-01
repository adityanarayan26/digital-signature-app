import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isRegistering) {
                await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
                setIsRegistering(false);
            } else {
                const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Authentication Error', error);
            alert('Error during authentication');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    {isRegistering ? 'Create Account' : 'Sign In'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                required
                                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-semibold transition"
                    >
                        {isRegistering ? 'Register' : 'Sign In'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                    </button>
                </div>
            </div>
        </div>
    );
}
