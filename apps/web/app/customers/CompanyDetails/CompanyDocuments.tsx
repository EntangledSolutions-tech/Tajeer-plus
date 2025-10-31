import React, { useState, useEffect, useCallback } from 'react';
import { Download, Trash2, Eye, Upload } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import { useHttpService } from '../../../lib/http-service';
import { toast } from '@kit/ui/sonner';

interface CompanyDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
}

interface CompanyDocumentsProps {
  companyId: string;
}

export default function CompanyDocuments({ companyId }: CompanyDocumentsProps) {
  const { getRequest, postRequest } = useHttpService();

  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getRequest(`/api/companies/${companyId}/documents`);

      if (result.success && result.data) {
        setDocuments(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [companyId, getRequest]);

  useEffect(() => {
    if (companyId) {
      fetchDocuments();
    }
  }, [fetchDocuments, companyId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('company_id', companyId);

      const result = await postRequest(`/api/companies/${companyId}/documents`, formData);

      if (result.success) {
        toast.success('Document uploaded successfully');
        fetchDocuments(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleDownload = async (doc: CompanyDocument) => {
    try {
      const result = await getRequest(`/api/companies/${companyId}/documents/${doc.id}/download`);

      if (result.success && result.data) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = doc.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(result.error || 'Failed to download document');
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const result = await postRequest(`/api/companies/${companyId}/documents/${documentId}/delete`, {});

      if (result.success) {
        toast.success('Document deleted successfully');
        fetchDocuments(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <CustomButton onClick={fetchDocuments}>
          Retry
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Company Documents</h3>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <CustomButton
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
            icon={<Upload className="w-4 h-4" />}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </CustomButton>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
          <p className="text-gray-600 mb-4">Upload documents for this company</p>
          <CustomButton
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
            icon={<Upload className="w-4 h-4" />}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </CustomButton>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {doc.file_type.split('/')[1]?.toUpperCase() || 'DOC'}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{doc.file_name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>Uploaded {formatDate(doc.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CustomButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  View
                </CustomButton>
                <CustomButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download
                </CustomButton>
                <CustomButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </CustomButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
