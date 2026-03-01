import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export default function Sign() {
    const { token } = useParams<{ token: string }>();
    const [signature, setSignature] = useState<any>(null);
    const [docUrl, setDocUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [isSigning, setIsSigning] = useState(false);
    const [finalDocUrl, setFinalDocUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchSignature();
    }, [token]);

    const fetchSignature = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/signatures/public/${token}`);
            setSignature(res.data);
            setDocUrl(`http://localhost:5000${res.data.documentId.fileUrl}`);
        } catch (err) {
            console.error(err);
            alert('Invalid or expired signature link');
        }
    };

    const handleSign = async () => {
        try {
            setIsSigning(true);
            const res = await axios.post(`http://localhost:5000/api/signatures/finalize/${token}`);
            setFinalDocUrl(`http://localhost:5000${res.data.fileUrl}`);
            alert('Document signed successfully!');
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || 'Error signing document');
        } finally {
            setIsSigning(false);
        }
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    if (!signature) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl overflow-hidden flex flex-col items-center py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Review and Sign Document</h1>
                <p className="text-gray-500 mb-6">Hello <span className="font-semibold text-gray-800">{signature.signerName}</span>, you have been requested to sign this document.</p>

                {finalDocUrl ? (
                    <div className="text-center bg-green-50 p-6 rounded-lg border border-green-200 w-full max-w-2xl mb-8">
                        <h2 className="text-xl font-bold text-green-700 mb-4">Document Signed!</h2>
                        <a href={finalDocUrl} target="_blank" rel="noreferrer" className="inline-block bg-green-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-700 transition">
                            Download Signed PDF
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full">
                        <div className="flex bg-gray-100 p-2 rounded-lg space-x-4 mb-4">
                            <button
                                onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                                disabled={pageNumber <= 1}
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-600 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                Page {pageNumber} of {numPages}
                            </span>
                            <button
                                onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
                                disabled={pageNumber >= numPages}
                                className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-600 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>

                        {docUrl && (
                            <div className="relative border shadow-md bg-white mb-6">
                                <Document file={docUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                    <Page pageNumber={pageNumber} />
                                </Document>

                                {/* Show signature placeholder if on correct page */}
                                {signature.coordinates && signature.coordinates.page === pageNumber && (
                                    <div
                                        className="absolute border-2 border-dashed border-blue-500 bg-blue-50/50 p-2 w-40 h-16 pointer-events-none flex flex-col items-center justify-center text-xs font-bold text-blue-700 shadow-sm"
                                        style={{ left: signature.coordinates.x, top: signature.coordinates.y, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <span>Sign Here</span>
                                        <span className="font-normal opacity-70">{signature.signerName}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleSign}
                            disabled={isSigning || signature.status === 'signed'}
                            className="w-full max-w-sm py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-bold transition disabled:opacity-50 text-lg shadow-md"
                        >
                            {isSigning ? 'Processing Signature...' : signature.status === 'signed' ? 'Already Signed' : 'Click to Sign'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
