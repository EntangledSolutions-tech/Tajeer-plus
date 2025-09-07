import React, { useState, useRef, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import { CustomFileInput } from '../../../reusableComponents/CustomFileInput';
import CustomButton from '../../../reusableComponents/CustomButton';
import { Trash2 } from 'lucide-react';

const documentFields = [
  { label: 'Document Name', name: 'docName', type: 'text', isRequired: true, min: 2, max: 100 },
  { label: 'Upload Document', name: 'docFile', type: 'file', isRequired: true, accept: '.pdf,.doc,.docx', disabled: false },
];

interface DocumentsStepProps {
  onDocumentsChange?: (documents: { name: string; file: File }[]) => void;
  initialDocuments?: { name: string; file?: File; document_url?: string }[];
}

export default function DocumentsStep({ onDocumentsChange, initialDocuments = [] }: DocumentsStepProps) {
  const { values, setFieldValue } = useFormikContext<{ docName: string; docFile: File | null }>();
  const [documents, setDocuments] = useState<{ name: string; file?: File; document_url?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onDocumentsChangeRef = useRef(onDocumentsChange);

  // Update ref when callback changes
  useEffect(() => {
    onDocumentsChangeRef.current = onDocumentsChange;
  }, [onDocumentsChange]);

  // Initialize documents from initial prop
  useEffect(() => {
    if (initialDocuments.length > 0) {
      setDocuments(initialDocuments);
    }
  }, [initialDocuments]);

  // Notify parent when documents change
  useEffect(() => {
    // Only notify with files that have actual File objects (newly added)
    const newDocuments = documents.filter(doc => doc.file);
    if (onDocumentsChangeRef.current) {
      onDocumentsChangeRef.current(newDocuments as { name: string; file: File }[]);
    }
  }, [documents]); // Remove onDocumentsChange from dependencies to prevent infinite loop

  const handleAddDocument = () => {
    const docName = values.docName;
    const docFile = values.docFile;

    if (docName && docFile) {
      setDocuments(prev => [
        ...prev,
        { name: docName, file: docFile }
      ]);
      // Clear the form fields
      setFieldValue('docName', '');
      setFieldValue('docFile', null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (idx: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Documents</h2>
      <div className="mb-8">
        <div className="mb-2 font-semibold text-primary">Add Document</div>
        <div className="mb-4">
          <CustomInput
            label="Document Name"
            name="docName"
            required={true}
            type="text"
            min={2}
            max={100}
          />
        </div>
        <div className="mb-4">
          <CustomFileInput
            label="Upload Document"
            name="docFile"
            required={true}
            accept=".pdf,.doc,.docx"
            ref={fileInputRef}
          />
        </div>
        <CustomButton
          type="button"
          onClick={handleAddDocument}
          disabled={!values.docName || !values.docFile}
        >
          <span className="text-xl leading-none">+</span> Add document
        </CustomButton>
        {/* Document List */}
        {documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between border border-primary/30 rounded-lg px-4 py-2 bg-white">
                <span className="text-primary font-medium">
                  {doc.name} {doc.file ? `(${doc.file.name})` : '(Existing document)'}
                </span>
                <CustomButton
                  type="button"
                  variant="ghost"
                  onClick={() => handleDelete(idx)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </CustomButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}