import React, { useState } from 'react';
import type { CNFProblem, Certificate } from '../types';
import { parseDimacs, exportToDimacs, validateDimacsFormat } from '../utils/dimacsParser';

interface ProblemUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemUploaded: (problem: CNFProblem, certificate?: Certificate) => void;
}

type UploadMethod = 'dimacs' | 'json' | 'guide';

export const ProblemUploadDialog: React.FC<ProblemUploadDialogProps> = ({
  isOpen,
  onClose,
  onProblemUploaded
}) => {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('dimacs');
  const [dimacsContent, setDimacsContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setWarnings([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (uploadMethod === 'dimacs') {
        setDimacsContent(content);
      } else if (uploadMethod === 'json') {
        setJsonContent(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDimacsParse = () => {
    setError(null);
    setWarnings([]);

    const result = parseDimacs(dimacsContent);
    
    if (!result.success) {
      setError(result.error || 'Failed to parse DIMACS file');
      return;
    }

    if (result.warnings) {
      setWarnings(result.warnings);
    }

    if (result.problem) {
      onProblemUploaded(result.problem);
      handleClose();
    }
  };

  const handleJsonParse = () => {
    setError(null);
    setWarnings([]);

    try {
      const parsed = JSON.parse(jsonContent);
      
      // Validate required fields
      if (!parsed.numVariables || !parsed.clauses) {
        setError('Invalid JSON: missing required fields (numVariables, clauses)');
        return;
      }

      if (!Array.isArray(parsed.clauses)) {
        setError('Invalid JSON: clauses must be an array');
        return;
      }

      // Create CNF problem
      const problem: CNFProblem = {
        numVariables: parsed.numVariables,
        clauses: parsed.clauses,
        description: parsed.description || 'User-uploaded JSON CNF',
        hasCertificate: !!parsed.certificate,
        certificate: parsed.certificate,
        problemSource: 'user-uploaded',
        tag: parsed.tag || 'SAT',
        suggestedOverlay: parsed.suggestedOverlay,
        realWorldContext: parsed.realWorldContext
      };

      // Optional certificate
      const certificate = parsed.certificate;

      onProblemUploaded(problem, certificate);
      handleClose();
    } catch (err) {
      setError(`JSON parse error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleClose = () => {
    setDimacsContent('');
    setJsonContent('');
    setError(null);
    setWarnings([]);
    setSelectedFile(null);
    onClose();
  };

  const exampleDimacs = `c Example 3-SAT problem
p cnf 3 2
1 -2 0
-1 2 3 0`;

  const exampleJson = `{
  "numVariables": 3,
  "clauses": [
    [
      { "city": { "x": 0, "y": 0, "num": 1 }, "positive": true },
      { "city": { "x": 1, "y": 0, "num": 2 }, "positive": false }
    ],
    [
      { "city": { "x": 0, "y": 0, "num": 1 }, "positive": false },
      { "city": { "x": 1, "y": 0, "num": 2 }, "positive": true },
      { "city": { "x": 2, "y": 0, "num": 3 }, "positive": true }
    ]
  ],
  "description": "Example problem",
  "tag": "SAT",
  "hasCertificate": true,
  "certificate": {
    "assignment": [true, true, false],
    "witnessLiterals": [0, 0],
    "complexity": 6
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-cyan-500/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400">Upload Problem</h2>
            <p className="text-sm text-slate-400 mt-1">
              Import CNF problems from DIMACS or JSON format
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Method Selector */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex gap-2">
            <button
              onClick={() => setUploadMethod('dimacs')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                uploadMethod === 'dimacs'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📄 DIMACS Format
            </button>
            <button
              onClick={() => setUploadMethod('json')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                uploadMethod === 'json'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🗂 JSON Format
            </button>
            <button
              onClick={() => setUploadMethod('guide')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                uploadMethod === 'guide'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📖 Format Guide
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4">
          {uploadMethod === 'dimacs' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">DIMACS CNF Format</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Standard format used by SAT solvers. Upload a .cnf file or paste content below.
                </p>
                
                {/* File Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Upload File
                  </label>
                  <input
                    type="file"
                    accept=".cnf,.txt"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-cyan-500 file:text-slate-900
                      hover:file:bg-cyan-400
                      file:cursor-pointer cursor-pointer"
                  />
                </div>

                {/* Text Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Or Paste Content
                  </label>
                  <textarea
                    value={dimacsContent}
                    onChange={(e) => setDimacsContent(e.target.value)}
                    placeholder={exampleDimacs}
                    className="w-full h-64 bg-slate-800 border border-slate-700 rounded-md p-3 text-slate-300 font-mono text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleDimacsParse}
                disabled={!dimacsContent.trim()}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-md transition-colors"
              >
                Parse DIMACS
              </button>
            </div>
          )}

          {uploadMethod === 'json' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">JSON Format (Extended)</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Our extended format with certificates and metadata. Upload a .json file or paste content below.
                </p>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Upload File
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-cyan-500 file:text-slate-900
                      hover:file:bg-cyan-400
                      file:cursor-pointer cursor-pointer"
                  />
                </div>

                {/* Text Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Or Paste Content
                  </label>
                  <textarea
                    value={jsonContent}
                    onChange={(e) => setJsonContent(e.target.value)}
                    placeholder={exampleJson}
                    className="w-full h-64 bg-slate-800 border border-slate-700 rounded-md p-3 text-slate-300 font-mono text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleJsonParse}
                disabled={!jsonContent.trim()}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-md transition-colors"
              >
                Parse JSON
              </button>
            </div>
          )}

          {uploadMethod === 'guide' && (
            <div className="space-y-4 text-slate-300">
              <h3 className="text-lg font-semibold text-cyan-400">Format Guide</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-cyan-300 mb-2">DIMACS CNF Format</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                    <li>Comment lines start with <code className="bg-slate-900 px-1 py-0.5 rounded">c</code></li>
                    <li>Problem line: <code className="bg-slate-900 px-1 py-0.5 rounded">p cnf &lt;vars&gt; &lt;clauses&gt;</code></li>
                    <li>Clause lines: <code className="bg-slate-900 px-1 py-0.5 rounded">&lt;lit&gt; &lt;lit&gt; ... 0</code></li>
                    <li>Positive integers = positive literals, negative = negated</li>
                    <li>Each clause terminates with 0</li>
                  </ul>
                  <pre className="bg-slate-900 p-3 rounded mt-3 text-xs overflow-x-auto">
{exampleDimacs}
                  </pre>
                </div>

                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-cyan-300 mb-2">JSON Format (Extended)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                    <li>Required: <code className="bg-slate-900 px-1 py-0.5 rounded">numVariables</code>, <code className="bg-slate-900 px-1 py-0.5 rounded">clauses</code></li>
                    <li>Optional: <code className="bg-slate-900 px-1 py-0.5 rounded">certificate</code> (for NP-Complete problems)</li>
                    <li>Optional: <code className="bg-slate-900 px-1 py-0.5 rounded">description</code>, <code className="bg-slate-900 px-1 py-0.5 rounded">tag</code>, <code className="bg-slate-900 px-1 py-0.5 rounded">realWorldContext</code></li>
                    <li>Each literal has: <code className="bg-slate-900 px-1 py-0.5 rounded">city</code> (with x, y, num) and <code className="bg-slate-900 px-1 py-0.5 rounded">positive</code></li>
                  </ul>
                  <pre className="bg-slate-900 p-3 rounded mt-3 text-xs overflow-x-auto">
{exampleJson}
                  </pre>
                </div>

                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-400 mb-2">💡 Tips</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                    <li>Keep problems under 25 variables for best performance</li>
                    <li>Include a certificate if you have a known solution (makes it NP-Complete)</li>
                    <li>Add meaningful descriptions and real-world context</li>
                    <li>Tag problems as TR (Traveling Salesman), SAT (Circuit), or AI (Neural Net)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-red-400 text-lg">⚠</span>
                <div>
                  <h4 className="font-semibold text-red-400">Error</h4>
                  <p className="text-sm text-slate-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warnings Display */}
          {warnings.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-lg">⚠</span>
                <div>
                  <h4 className="font-semibold text-yellow-400">Warnings</h4>
                  <ul className="text-sm text-slate-300 mt-1 space-y-1">
                    {warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


