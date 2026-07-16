import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function TabDocuments({ employee }) {
    const isSouthAfrican = employee?.sa_id_number && employee.sa_id_number.trim().length === 13;

    const documentOptions = isSouthAfrican 
        ? ['ID Copy', 'Tax Certificate', 'Proof of Address']
        : ['Passport', 'Work Permit', 'Asylum Document', 'Visa'];

    // Local form states
    const [documentType, setDocumentType] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [documentsList, setDocumentsList] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const fetchEmployeeDocuments = async () => {
        try {
            setLoadingDocs(true);
            const { data: dbRecords, error: dbError } = await supabase
                .from('employee_documents')
                .select('*')
                .eq('employee_id', employee.id)
                .order('uploaded_at', { ascending: false });

            if (dbError) throw dbError;

            const enrichedRecords = await Promise.all(
                dbRecords.map(async (doc) => {
                    const { data: signData, error: signError } = await supabase.storage
                        .from('employee-files')
                        .createSignedUrl(doc.file_url, 900);

                    return {
                        ...doc,
                        secureViewUrl: signError ? null : signData?.signedUrl
                    };
                })
            );

            setDocumentsList(enrichedRecords);
        } catch (error) {
            console.error('Error pre-loading documents:', error.message);
        } finally {
            setLoadingDocs(false);
        }
    };

    useEffect(() => {
        if (employee?.id) {
            fetchEmployeeDocuments();
        }
    }, [employee?.id]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]); // Extracted the precise binary object at index 0
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!documentType || !selectedFile) {
            alert('Please select both a document type and a file to upload.');
            return;
        }

        try {
            setIsUploading(true);

            const fileExtension = selectedFile.name.split('.').pop();
            const uniqueFileName = `${employee.id}/${Date.now()}_${documentType.replace(/\s+/g, '_').toLowerCase()}.${fileExtension}`;

            const { data: storageData, error: storageError } = await supabase.storage
                .from('employee-files')
                .upload(uniqueFileName, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (storageError) throw storageError;

            const { error: dbError } = await supabase
                .from('employee_documents')
                .insert([{
                    employee_id: employee.id,
                    document_type: documentType,
                    file_url: storageData.path,
                    expiry_date: expiryDate || null,
                    is_certified: true
                }]);

            if (dbError) throw dbError;

            setDocumentType('');
            setExpiryDate('');
            setSelectedFile(null);
            
            const fileInput = document.getElementById('document-file-picker');
            if (fileInput) fileInput.value = '';

            alert('Document uploaded successfully.');
            fetchEmployeeDocuments();

        } catch (error) {
            console.error('Upload sequence aborted:', error.message);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                    <h4 className="text-sm font-semibold text-slate-900">Required Documentation Workspace</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Classification profile: <span className="font-semibold text-slate-700">{isSouthAfrican ? 'South African Citizen (Local)' : 'Foreign National (Compliance Track)'}</span>
                    </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium px-3 py-1 rounded-md">
                    ⚠️ Note: All uploaded files must be officially certified copies.
                </div>
            </div>

            <form onSubmit={handleUpload} className="bg-slate-50 border border-slate-100 p-4 rounded-lg grid grid-cols-4 gap-4 items-end text-sm">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Select Document Type</label>
                    <select 
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        disabled={isUploading}
                        className="w-full px-3 py-1.5 text-slate-800 bg-white border border-slate-200 rounded-md focus:outline-none text-xs"
                    >
                        <option value="">Choose document...</option>
                        {documentOptions.map((doc) => (
                            <option key={doc} value={doc}>{doc}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Expiry Date (If Applicable)</label>
                    <input 
                        type="date" 
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        disabled={isUploading}
                        className="w-full px-3 py-1.5 text-slate-800 bg-white border border-slate-200 rounded-md focus:outline-none text-xs"
                    />
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Choose File</label>
                    <input 
                        id="document-file-picker"
                        type="file" 
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isUploading}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium h-9 px-4 rounded-md transition-colors cursor-pointer disabled:bg-slate-400"
                >
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
            </form>

            <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Document Vault</h5>
                
                {loadingDocs ? (
                    <div className="text-center p-6 text-xs text-slate-400 italic animate-pulse">
                        Loading workspace records...
                    </div>
                ) : documentsList.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-sm text-slate-400">
                        No verified documents uploaded to this profile yet.
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                        {documentsList.map((documentItem) => {
                            const isExpired = documentItem.expiry_date && new Date(documentItem.expiry_date) < new Date();
                            const isNearingExpiry = documentItem.expiry_date && !isExpired && 
                                (new Date(documentItem.expiry_date) - new Date()) / (1000 * 60 * 60 * 24) <= 30;

                            const handleDownload = async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                console.log("====== ROS SECURE FETCH DIAGNOSTIC LOG ======");
                                console.log("1. Target Employee ID:", employee?.id);
                                console.log("2. Raw Database File Path Row:", documentItem.file_url);

                                try {
                                    const { data, error } = await supabase.storage
                                        .from('employee-files')
                                        .createSignedUrl(documentItem.file_url, 60);

                                    if (error) {
                                        console.error("3. Supabase Signed URL API Error:", error.message);
                                        throw error;
                                    }

                                    console.log("3. Supabase Signed URL API Response Data:", data);
                                    
                                    if (data?.signedUrl) {
                                        const downloadAnchor = document.createElement('a');
                                        downloadAnchor.href = data.signedUrl;
                                        downloadAnchor.target = '_blank';
                                        downloadAnchor.rel = 'noopener noreferrer';
                                        document.body.appendChild(downloadAnchor);
                                        downloadAnchor.click();
                                        document.body.removeChild(downloadAnchor);
                                    }
                                } catch (err) {
                                    console.error('Sequence Aborted:', err);
                                    alert(`Could not open document: ${err.message}`);
                                }
                            };

                            return (
                                <div key={documentItem.id} className="p-3 flex justify-between items-center text-xs hover:bg-slate-50 transition-colors">
                                    <div>
                                        <span className="font-semibold text-slate-800 text-sm block">{documentItem.document_type}</span>
                                        <span className="text-slate-400 block mt-0.5">
                                            Uploaded: {new Date(documentItem.uploaded_at).toLocaleDateString()}
                                            {documentItem.expiry_date && (
                                                <span className={`ml-1 font-medium ${
                                                    isExpired ? 'text-rose-600' : isNearingExpiry ? 'text-amber-600' : 'text-slate-400'
                                                }`}>
                                                    | Expires: {new Date(documentItem.expiry_date).toLocaleDateString()} 
                                                    {isExpired && ' (EXPIRED)'}
                                                    {isNearingExpiry && ' (RENEWAL REQUIRED)'}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2 py-0.5 rounded text-[10px]">
                                            ✓ Certified Copy
                                        </span>
                                        <a
                                            href={documentItem.secureViewUrl}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-md inline-block"
                                        >
                                            View & Print
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}