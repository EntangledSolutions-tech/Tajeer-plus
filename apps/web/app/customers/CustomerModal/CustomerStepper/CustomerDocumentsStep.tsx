import React, { useState, useRef, useEffect } from 'react';
import { SimpleInput } from '../../../reusableComponents/CustomInput';
import CustomButton from '../../../reusableComponents/CustomButton';
import { Trash2 } from 'lucide-react';

const documentFields = [
  { label: 'Document Name', name: 'docName', type: 'text', isRequired: true, min: 2, max: 100 },
  { label: 'Upload Document', name: 'docFile', type: 'file', isRequired: true, accept: '.pdf,.doc,.docx', disabled: false },
];

interface CustomerDocumentsStepProps {
  onDocumentsChange?: (documents: { name: string; file: File }[]) => void;
}

export default function CustomerDocumentsStep({ onDocumentsChange }: CustomerDocumentsStepProps) {
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<{ name: string; file: File }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent when documents change
  useEffect(() => {
    onDocumentsChange?.(documents);
  }, [documents, onDocumentsChange]);

  const handleAddDocument = () => {
    if (docName && docFile) {
      setDocuments(prev => [
        ...prev,
        { name: docName, file: docFile, created_at: new Date().toISOString() }
      ]);
      // Clear the form fields
      setDocName('');
      setDocFile(null);
      // Clear the file input manually since file inputs can't be controlled
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDocFile(file);
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
          <SimpleInput
            label="Document Name"
            name="docName"
            required={true}
            type="text"
            min={2}
            max={100}
            value={docName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocName(e.target.value)}
          />
        </div>
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
        <CustomButton
          type="button"
          onClick={handleAddDocument}
          disabled={!docName || !docFile}
        >
          <span className="text-xl leading-none">+</span> Add document
        </CustomButton>

        {/* Document List */}
        {documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between border border-primary/30 rounded-lg px-4 py-2 bg-white">
                <span className="text-primary font-medium">{doc.name} ({doc.file.name})</span>
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