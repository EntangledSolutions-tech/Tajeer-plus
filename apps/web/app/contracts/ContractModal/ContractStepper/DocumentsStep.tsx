import React, { useState, useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';
import { toast } from '@kit/ui/sonner';
import { Plus, Upload, X, FileText, Trash2 } from 'lucide-react';
import { SimpleInput } from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';

interface Document {
  id: string;
  name: string;
  file: File | null;
  uploaded: boolean;
}

export default function DocumentsStep() {
  const formik = useFormikContext<any>();

  // Form state for new document
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get documents from Formik values
  const documents = formik.values.documents || [];

  const handleAddDocument = () => {
    if (docName && docFile) {
      const newDocument: Document = {
        id: Date.now().toString(),
        name: docName,
        file: docFile,
        uploaded: true
      };

      const updatedDocuments = [...documents, newDocument];
      formik.setFieldValue('documents', updatedDocuments);
      formik.setFieldValue('documentsCount', updatedDocuments.length);

      // Clear form
      setDocName('');
      setDocFile(null);
      // Clear the file input manually since file inputs can't be controlled
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Trigger validation to enable the next button
      setTimeout(() => {
        formik.validateForm();
      }, 100);
    }
  };

  const handleDelete = (documentId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    formik.setFieldValue('documents', updatedDocuments);
    formik.setFieldValue('documentsCount', updatedDocuments.length);

    // Trigger validation to enable the next button
    setTimeout(() => {
      formik.validateForm();
    }, 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      return 'Please upload only PDF, DOC, or DOCX files';
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        e.target.value = '';
        return;
      }
    }
    setDocFile(file);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">
        Documents
      </h2>
      <p className="text-primary/70 mb-8">
        Upload required documents for this contract.
      </p>

      {/* Add Document Form */}
      <div className="mb-8">
        <div className="mb-2 font-semibold text-primary">Add Document</div>

        {/* Document Name */}
        <div className="mb-4">
          <SimpleInput
            label="Document Name"
            name="docName"
            type="text"
            placeholder="eg. Insurance Doc"
            required={true}
            value={docName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocName(e.target.value)}
            min={2}
            max={100}
          />
        </div>

        {/* Upload Document */}
        <div className="mb-4">
          <div className="w-full">
            <label className="block text-primary font-medium mb-1">
              Upload Document <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="docFile"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="w-full h-12 border border-primary/30 rounded-lg px-4 py-2 text-primary bg-white placeholder:text-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Add Document Button */}
        <CustomButton
          type="button"
          onClick={handleAddDocument}
          disabled={!docName || !docFile}
        >
          <Plus className="w-4 h-4" />
          Add document
        </CustomButton>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Uploaded Documents ({documents.length})
            </h3>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between border border-primary/30 rounded-lg px-4 py-2 bg-white">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <div>
                      <span className="text-primary font-medium">{doc.name}</span>
                      <span className="text-muted-foreground ml-2">({doc.file?.name})</span>
                      <div className="text-sm text-muted-foreground">
                        {doc.file ? formatFileSize(doc.file.size) : ''}
                      </div>
                    </div>
                  </div>
                  <CustomButton
                    type="button"
                    variant="ghost"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </CustomButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Validation error display */}
      {formik.touched.documents && formik.errors.documents && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{String(formik.errors.documents)}</p>
        </div>
      )}
    </>
  );
}