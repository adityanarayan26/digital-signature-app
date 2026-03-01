import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, FileText } from 'lucide-react';

interface DocumentType {
    _id: string;
    title: string;
    fileUrl: string;
    createdAt: string;
}

export default function Dashboard() {
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchDocuments();
    }, [navigate]);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/docs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(res.data);
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);

        try {
            await axios.post('http://localhost:5000/api/docs/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFile(null);
            fetchDocuments();
        } catch (err) {
            console.error('Upload failed', err);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">DocSign Pro</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Document</h2>
                    <form onSubmit={handleUpload} className="flex items-center space-x-4">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <button
                            type="submit"
                            disabled={!file || isUploading}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Documents</h2>
                {documents.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <FileText className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-4 text-gray-500">No documents uploaded yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div key={doc._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors">
                                <div className="flex items-start">
                                    <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                                    <div className="ml-4">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate" title={doc.title}>
                                            {doc.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 flex items-center justify-between">
                                    <a
                                        href={`http://localhost:5000${doc.fileUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        View PDF
                                    </a>
                                    <button onClick={() => navigate(`/editor/${doc._id}`)} className="text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                                        Sign / Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
