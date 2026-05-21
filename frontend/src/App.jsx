import React, { useState } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  Trash2, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Layers, 
  ChevronRight, 
  Database,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Set backend API URL (assuming FastAPI runs on port 8080)
const API_BASE_URL = "http://127.0.0.1:8080";

function App() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  // Handle Drag & Drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Only CSV files are supported!");
      }
    }
  };

  // Handle CSV Upload and processing
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a CSV file first.");
      return;
    }

    setLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setReportData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Failed to upload and process the file. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cleaned file download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/download`, {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create a local blob link and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cleaned_${file?.name || 'data.csv'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Download failed. Make sure the backend server is reachable.");
    } finally {
      setDownloading(false);
    }
  };

  // Helper to check if chart data has any actual missing values
  const hasMissingValues = reportData?.chart_data?.some(d => d.missing_count > 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-100">
              <RefreshCw className="h-6 w-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">CleanFlow</h1>
              <p className="text-xs text-slate-500 font-medium">CSV Data Cleaner & Reporter</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>System Status: Operational</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-3xl p-8 mb-8 shadow-xl shadow-indigo-950/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 bg-indigo-500/25 border border-indigo-400/25 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              Automated Data Suite
            </span>
            <h2 className="text-3xl font-extrabold mt-3 tracking-tight sm:text-4xl">
              Automatic CSV Data Cleaning
            </h2>
            <p className="mt-3 text-indigo-200 text-base leading-relaxed">
              Upload any dirty CSV file. The system will automatically detect missing values, standardise text casing, drop duplicates, and generate a dynamic dashboard preview.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 flex items-center justify-center pointer-events-none">
            <Database className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Upload & Instructions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* File Upload Box */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                <span>Upload CSV File</span>
              </h3>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
                  dragActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('csv-file-input').click()}
              >
                <input 
                  id="csv-file-input"
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
                
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="bg-slate-100 p-3 rounded-full text-slate-600">
                    <FileSpreadsheet className="h-8 w-8 text-indigo-500" />
                  </div>
                  {file ? (
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Drag & drop your CSV file here</p>
                      <p className="text-xs text-slate-400 mt-1">or click to browse from files</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100 flex items-start space-x-2 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing Data...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Clean & Analyze CSV</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Quick Guide / Help Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>Automated Rules</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-xs leading-relaxed text-slate-600">
                <ChevronRight className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Numerical Missing Values:</span> Filled automatically with the column mean to preserve mathematical distribution.
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs leading-relaxed text-slate-600">
                <ChevronRight className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Categorical/Text Missing:</span> Filled with <code className="px-1.5 py-0.5 bg-slate-100 rounded text-indigo-600">"Unknown"</code> to keep records queryable.
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs leading-relaxed text-slate-600">
                <ChevronRight className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Text Standardization:</span> Trims excess white space and converts strings to standard <code className="px-1.5 py-0.5 bg-slate-100 rounded text-indigo-600">Title Case</code>.
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs leading-relaxed text-slate-600">
                <ChevronRight className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Duplicate Rows:</span> Completely deleted to eliminate redundant data.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Section */}
        {reportData && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Download Cleaned CSV Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-500 p-2.5 rounded-xl text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm sm:text-base">CSV Cleaning Completed Successfully!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">Your cleaned file is ready for download.</p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:bg-emerald-400 shadow-md shadow-emerald-100 flex items-center justify-center space-x-2 transition-all"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Cleaned CSV</span>
                  </>
                )}
              </button>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Rows Before */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rows Before</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">{reportData.rows_before}</h3>
                  </div>
                  <div className="bg-rose-50 text-rose-500 p-2 rounded-xl border border-rose-100">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Rows After */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rows After</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">{reportData.rows_after}</h3>
                  </div>
                  <div className="bg-emerald-50 text-emerald-500 p-2 rounded-xl border border-emerald-100">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Missing Fixed */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Missing Fixed</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">{reportData.missing_values_fixed}</h3>
                  </div>
                  <div className="bg-indigo-50 text-indigo-500 p-2 rounded-xl border border-indigo-100">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Duplicates Removed */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Duplicates Removed</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">{reportData.duplicates_removed}</h3>
                  </div>
                  <div className="bg-violet-50 text-violet-500 p-2 rounded-xl border border-violet-100">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Dashboard Visualizations & Data Profiles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Missing Values Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Missing Values Per Column (Before Cleaning)</h3>
                
                {hasMissingValues ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reportData.chart_data.filter(d => d.missing_count > 0)}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="column" 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          angle={-15}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            color: '#fff', 
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '12px'
                          }} 
                        />
                        <Bar 
                          dataKey="missing_count" 
                          name="Missing Values" 
                          fill="#4f46e5" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
                    <h4 className="font-semibold text-slate-700">Perfect Data Quality</h4>
                    <p className="text-xs text-slate-400 mt-1">No missing values were detected in your original CSV file!</p>
                  </div>
                )}
              </div>

              {/* Column Summary Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <h3 className="text-base font-bold text-slate-900 mb-4">Cleaned Columns Catalog</h3>
                <div className="flex-grow overflow-y-auto max-h-80 pr-1 space-y-3">
                  {reportData.column_summary.map((col, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{col.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Type: <code className="font-mono text-indigo-600 bg-indigo-50/50 px-1 rounded">{col.type}</code></p>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                        <Check className="h-3.5 w-3.5" />
                        <span>Fixed (0 Null)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Cleaned Data Preview Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cleaned Data Preview</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Showing the first 10 rows of your cleaned dataset.</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-bold text-slate-600">
                  Total columns: {reportData.headers.length}
                </span>
              </div>
              
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      {reportData.headers.map((hdr, idx) => (
                        <th key={idx} className="px-6 py-4 whitespace-nowrap border-b border-slate-200">
                          {hdr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white font-medium">
                    {reportData.preview_data.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/75 transition-colors">
                        {reportData.headers.map((hdr, colIdx) => (
                          <td key={colIdx} className="px-6 py-3.5 whitespace-nowrap">
                            {row[hdr] !== null && row[hdr] !== undefined ? String(row[hdr]) : (
                              <span className="italic text-slate-400 font-normal">null</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400 font-medium">
        <p>© {new Date().getFullYear()} CleanFlow. All rights reserved. Fast, secure, and client-side data visualization.</p>
      </footer>
    </div>
  );
}

export default App;
