import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export default function Editor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [docUrl, setDocUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [signatures, setSignatures] = useState<any[]>([]);

    // Simple drag state
    const [dragPos, setDragPos] = useState({ x: 50, y: 50 });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) navigate('/login');
        fetchDoc();
        fetchSignatures();
    }, [id, token]);

    const fetchDoc = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/docs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocUrl(`${API_URL}${res.data.fileUrl}`);
        } catch (err) {
            console.error(err);
            navigate('/dashboard');
        }
    };

    const fetchSignatures = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/signatures/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSignatures(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', 'signature');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();

        // Calculate position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setDragPos({ x, y });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const createSignatureRequest = async () => {
        const signerEmail = prompt("Enter signer email");
        const signerName = prompt("Enter signer name");
        if (!signerEmail || !signerName) return;

        try {
            await axios.post(`${API_URL}/api/signatures`, {
                documentId: id,
                signerName,
                signerEmail,
                coordinates: { x: dragPos.x, y: dragPos.y, page: pageNumber }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Signature requested successfully!');
            fetchSignatures();
        } catch (err) {
            console.error(err);
            alert('Error requesting signature');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar Tool panel */}
            <div className="w-64 bg-white border-r p-4 flex flex-col shadow-sm z-10">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Tools</h2>

                <div
                    className="bg-blue-50 border-2 border-blue-400 border-dashed rounded-lg p-3 text-center cursor-grab active:cursor-grabbing hover:bg-blue-100 transition"
                    draggable
                    onDragStart={handleDragStart}
                >
                    <span className="text-blue-700 font-semibold select-none">Signature Block</span>
                </div>

                <div className="mt-8 border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pending Signatures</h3>
                    {signatures.map((sig, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded mb-2 border text-sm">
                            <span className="font-medium text-gray-700">{sig.signerName}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${sig.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {sig.status}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto flex flex-col items-center py-6 relative">
                <div className="mb-4 bg-white px-4 py-2 rounded-lg shadow-sm flex items-center space-x-4">
                    <button
                        onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                        disabled={pageNumber <= 1}
                        className="px-3 py-1 bg-gray-100 rounded text-gray-600 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                        Page {pageNumber} of {numPages}
                    </span>
                    <button
                        onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
                        disabled={pageNumber >= numPages}
                        className="px-3 py-1 bg-gray-100 rounded text-gray-600 disabled:opacity-50"
                    >
                        Next
                    </button>

                    <button
                        onClick={createSignatureRequest}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition ml-4"
                    >
                        Save Placements
                    </button>
                </div>

                {docUrl && (
                    <div
                        className="relative border shadow-xl bg-white"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <Document file={docUrl} onLoadSuccess={onDocumentLoadSuccess}>
                            <Page pageNumber={pageNumber} />
                        </Document>

                        {/* Dropped Signature Block */}
                        <div
                            className="absolute bg-blue-100/80 border-2 border-blue-500 p-2 w-40 h-16 pointer-events-none flex whitespace-normal items-center justify-center text-sm font-bold text-blue-700 shadow-sm"
                            style={{ left: dragPos.x, top: dragPos.y, transform: 'translate(-50%, -50%)' }}
                        >
                            Sign Here
                        </div>

                        {/* Existing Signatures */}
                        {signatures.filter(s => s.coordinates.page === pageNumber).map((sig) => (
                            <div
                                key={sig._id}
                                className={`absolute border-2 p-2 w-40 h-16 pointer-events-none flex whitespace-normal items-center justify-center text-sm font-bold opacity-80 ${sig.status === 'signed' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-yellow-100 border-yellow-500 text-yellow-700'}`}
                                style={{ left: sig.coordinates.x, top: sig.coordinates.y, transform: 'translate(-50%, -50%)' }}
                            >
                                {sig.status === 'signed' ? `Signed: ${sig.signerName}` : `Pending: ${sig.signerName}`}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
