'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, Eye, Trash2, Plus, X } from 'lucide-react';
import { Input } from '@kit/ui/input';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@kit/ui/alert-dialog';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomModal from '../../reusableComponents/CustomModal';
import { CollapsibleSection } from '../../reusableComponents/CollapsibleSection';
import CustomTable, { TableColumn } from '../../reusableComponents/CustomTable';
import { useHttpService } from '../../../lib/http-service';

interface Document {
  id: string;
  document_name: string;
  document_type?: string;
  document_url: string;
  file_name?: string;
  file_size?: number;
  uploaded_at: string;
  created_at?: string;
  // Mapped fields for compatibility
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploaded: boolean;
  uploadedAt: string;
}

interface CustomerDocumentsProps {
  customerId: string | undefined;
}

export default function CustomerDocuments({ customerId }: CustomerDocumentsProps) {
  const { getRequest, postRequest, deleteRequest } = useHttpService();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [viewerDoc, setViewerDoc] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [addDocError, setAddDocError] = useState<string | null>(null);
  const [addDocLoading, setAddDocLoading] = useState(false);

  // Fetch documents from database
  const fetchDocuments = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      const result = await getRequest(`/api/customers/${customerId}/documents`);
      if (result.success && result.data) {
        // Map API response to expected format
        const mappedDocuments = result.data.documents?.map((doc: any) => {
          return {
            ...doc,
            name: doc.document_name || '',
            fileName: doc.file_name || doc.document_name || '',
            fileUrl: doc.document_url || '',
            fileSize: doc.file_size || 0,
            mimeType: doc.document_type || 'unknown',
            uploaded: true,
            uploadedAt: doc.uploaded_at || doc.created_at || new Date().toISOString()
          };
        }) || [];

        setDocuments(mappedDocuments);
        setFilteredDocuments(mappedDocuments);
      } else {
        setError(result.error || 'Failed to fetch documents');
      }
    } catch (error) {
      setError('Error fetching documents');
    } finally {
      setLoading(false);
    }
  };

  // Filter documents based on search term
  useEffect(() => {
    const filtered = documents.filter(doc =>
      (doc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doc.fileName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  }, [searchTerm, documents]);

  // Load documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, [customerId]);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNewDocFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocFile(e.target.files[0]);
    }
  };

  const handleAddDocument = async () => {
    if (!customerId) return;

    setAddDocError(null);
    if (!newDocName || !newDocFile) {
      setAddDocError('Please provide both document name and file.');
      return;
    }

    try {
      setAddDocLoading(true);
      const formData = new FormData();
      formData.append('file', newDocFile);
      formData.append('documentName', newDocName);

      const result = await postRequest(`/api/customers/${customerId}/documents`, formData);

      if (result.success && result.data) {
        // Map the new document to expected format
        const mappedDocument = {
          ...result.data.document,
          name: result.data.document.document_name || '',
          fileName: result.data.document.file_name || result.data.document.document_name || '',
          fileUrl: result.data.document.document_url || '',
          fileSize: result.data.document.file_size || 0,
          mimeType: result.data.document.document_type || 'unknown',
          uploaded: true,
          uploadedAt: result.data.document.uploaded_at || result.data.document.created_at || new Date().toISOString()
        };

        setDocuments(prev => [mappedDocument, ...prev]);
        setFilteredDocuments(prev => [mappedDocument, ...prev]);
        setNewDocName('');
        setNewDocFile(null);
        setUploadModalOpen(false);
        // Refresh documents list
        fetchDocuments();
      } else {
        setAddDocError(result.error || 'Failed to upload document.');
      }
    } catch (e) {
      setAddDocError('Error uploading document.');
    } finally {
      setAddDocLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (deleteIndex === null || !customerId) return;

    const documentToDelete = documents[deleteIndex];
    if (!documentToDelete) return;

    try {
      const result = await deleteRequest(`/api/customers/${customerId}/documents?documentId=${documentToDelete.id}`);

      if (result.success) {
        setDocuments(prev => prev.filter((_, index) => index !== deleteIndex));
        setFilteredDocuments(prev => prev.filter((_, index) => index !== deleteIndex));
        setDeleteIndex(null);
      } else {
        setError(result.error || 'Failed to delete document.');
      }
    } catch (error) {
      setError('Error deleting document.');
    }
  };

  const handleViewDocument = (document: Document) => {
    setViewerDoc(document);
    setViewerOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Document Name',
      type: 'text',
      sortable: true
    },
    {
      key: 'fileName',
      label: 'File Name',
      type: 'text',
      sortable: true
    },
    {
      key: 'fileSize',
      label: 'Size',
      type: 'text',
      render: (value: number) => formatFileSize(value)
    },
    {
      key: 'uploadedAt',
      label: 'Uploaded',
      type: 'text',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: '',
      type: 'action',
      render: (value: string, row: Document) => (
        <div className="flex items-center justify-end space-x-2">
          <CustomButton
            variant="ghost"
            size="sm"
            onClick={() => handleViewDocument(row)}
            className="text-primary hover:bg-primary/5"
          >
            <Eye className="w-4 h-4" />
          </CustomButton>
          <CustomButton
            variant="ghost"
            size="sm"
            onClick={() => setDeleteIndex(documents.findIndex(doc => doc.id === row.id))}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </CustomButton>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary font-medium">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Error Alert Box */}
      {error && (
        <div className="mx-auto mt-6 mb-2 w-full max-w-2xl bg-primary/10 border border-primary/20 text-primary px-6 py-4 rounded-lg font-semibold text-center">
          {error}
          <CustomButton
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-4 text-primary underline"
          >
            Dismiss
          </CustomButton>
        </div>
      )}

      {/* Upload Document Modal */}
      <CustomModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Document"
        maxWidth="max-w-2xl"
      >
        <div className="p-6 space-y-6">
          {addDocError && (
            <div className="mb-6 w-full bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg font-semibold text-center">
              {addDocError}
              <CustomButton
                variant="ghost"
                size="sm"
                onClick={() => setAddDocError(null)}
                className="ml-4 text-red-700 underline"
              >
                Dismiss
              </CustomButton>
            </div>
          )}

          {/* Document Name */}
          <div>
            <label className="block text-primary font-medium mb-2">Document Name</label>
            <Input
              type="text"
              placeholder="e.g., Insurance Document"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              className="w-full border border-primary rounded-lg px-4 py-2"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-primary font-medium mb-2">Upload File</label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/10' : 'border-primary bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {newDocFile ? (
                <div className="space-y-2">
                  <div className="text-primary font-medium">{newDocFile.name}</div>
                  <div className="text-sm text-gray-600">{formatFileSize(newDocFile.size)}</div>
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewDocFile(null)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Remove file
                  </CustomButton>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-primary" />
                  <div>
                    <p className="text-primary font-medium">Drop your file here</p>
                    <p className="text-sm text-gray-600">or</p>
                    <CustomButton
                      variant="ghost"
                      onClick={handleBrowseFiles}
                      className="text-primary underline hover:text-primary/80"
                    >
                      browse files
                    </CustomButton>
                  </div>
                  <p className="text-xs text-gray-600">PDF, DOC, DOCX, Images up to 50MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              className="hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <CustomButton
              variant="outline"
              onClick={() => setUploadModalOpen(false)}
              disabled={addDocLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="primary"
              onClick={handleAddDocument}
              disabled={!newDocName || !newDocFile || addDocLoading}
              loading={addDocLoading}
            >
              {addDocLoading ? 'Uploading...' : 'Upload Document'}
            </CustomButton>
          </div>
        </div>
      </CustomModal>

      {/* Document Viewer Modal */}
      <CustomModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={viewerDoc?.name || "Document Viewer"}
        maxWidth="max-w-4xl"
      >
        <div className="p-6">
          {viewerDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">File Name:</span>
                  <span className="ml-2 text-primary">{viewerDoc.fileName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">File Size:</span>
                  <span className="ml-2 text-primary">{formatFileSize(viewerDoc.fileSize)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Uploaded:</span>
                  <span className="ml-2 text-primary">
                    {new Date(viewerDoc.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Type:</span>
                  <span className="ml-2 text-primary">{viewerDoc.mimeType}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <CustomButton
                  variant="primary"
                  onClick={() => window.open(viewerDoc.fileUrl, '_blank')}
                  icon={<Eye className="h-4 w-4" />}
                >
                  View Document
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </CustomModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this document? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end space-x-3 mt-4">
            <AlertDialogCancel asChild>
              <CustomButton variant="outline">Cancel</CustomButton>
            </AlertDialogCancel>
            <AlertDialogAction asChild onClick={handleDeleteDocument}>
              <CustomButton variant="destructive">Delete</CustomButton>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <CollapsibleSection
        title="Customer Documents"
        defaultOpen={true}
        className="mb-6 mx-0"
        headerClassName="bg-[#F6F9FF]"
        headerButton={
          <CustomButton
            variant="primary"
            onClick={() => setUploadModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Upload Document
          </CustomButton>
        }
      >
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Documents Table */}
          <CustomTable
            data={filteredDocuments}
            columns={columns}
            loading={false}
            emptyMessage="No documents found"
            className="w-full"
            searchable={false}
            actionsColumn={false}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}