import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Printer, RefreshCw } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const EMRReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  
  useEffect(() => {
    // Check if report exists in localStorage
    const savedReports = JSON.parse(localStorage.getItem('emrReports') || '{}');
    const reportData = savedReports[reportId];
    
    if (reportData) {
      setReport(reportData);
      
      // If report is pending analysis, connect to WebSocket to receive updates
      if (reportData.pending) {
        connectWebSocket(reportData.transcript, savedReports, reportId);
      }
    } else {
      setError("Report not found");
    }
    
    setLoading(false);
    
    // Cleanup
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [reportId]);

  // WebSocket connection for EMR generation
  const connectWebSocket = (transcript, savedReports, reportId) => {
    const ws = new WebSocket('ws://localhost:8000/transcription');
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connection established for EMR generation');
      // Send the transcript for analysis
      ws.send(JSON.stringify({ 
        command: "generate_emr",
        transcript: transcript
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);
        
        if (data.type === 'final_analysis' && data.analysis) {
          const analysis = data.analysis;
          
          // Get the current report from localStorage to ensure we have the latest
          const currentSavedReports = JSON.parse(localStorage.getItem('emrReports') || '{}');
          const currentReport = currentSavedReports[reportId];
          
          if (!currentReport) {
            console.error("Report not found in localStorage");
            return;
          }
          
          // Create updated report
          const updatedReport = {
            patientInfo: currentReport.patientInfo,
            transcript: transcript,
            pending: false,
            rawAnalysis: analysis
          };
          
          // Update localStorage
          currentSavedReports[reportId] = updatedReport;
          localStorage.setItem('emrReports', JSON.stringify(currentSavedReports));
          
          // Update state
          setReport(updatedReport);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to EMR generation service');
    };
  };

  const downloadReport = () => {
    const reportElement = document.getElementById('emr-report');
    
    const opt = {
      margin: 10,
      filename: `EMR_Report_${reportId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(reportElement).save();
  };
  
  const printReport = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1">Back</span>
          </button>
          
          <h1 className="text-2xl font-bold mb-6">Error</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/appointments')}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Return to Appointments
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto print:p-0">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6 print:shadow-none print:border-none">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-emerald-600 hover:text-emerald-700 print:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="ml-1">Back</span>
          </button>
          
          <div className="flex items-center space-x-4 print:hidden">
            {report.pending ? (
              <div className="flex items-center text-amber-500">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <button 
                  onClick={downloadReport} 
                  className="flex items-center text-emerald-600 hover:text-emerald-700 py-2 px-4 border border-emerald-600 rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span>Download PDF</span>
                </button>
                
                <button
                  onClick={printReport} 
                  className="flex items-center text-emerald-600 hover:text-emerald-700 py-2 px-4 border border-emerald-600 rounded-lg"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  <span>Print</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        <div id="emr-report">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-700">Vitalis Medical Center</h1>
            <p className="text-gray-600">123 Health Avenue, Medical District, CA 90210</p>
            <p className="text-gray-600">Phone: (123) 456-7890 | Fax: (123) 456-7899</p>
            <hr className="my-4 border-emerald-200" />
            <h2 className="text-2xl font-bold">Electronic Medical Record</h2>
            <p className="text-gray-600">Generated on: {new Date().toLocaleString()}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-b border-gray-200 pb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Name:</strong> {report.patientInfo.name}</p>
                <p><strong>Age:</strong> {report.patientInfo.age}</p>
                <p><strong>Gender:</strong> {report.patientInfo.gender}</p>
                <p><strong>Report ID:</strong> {reportId}</p>
                <p><strong>Appointment Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Consultation Type</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {report.pending ? (
                  <p className="text-amber-500">Analyzing...</p>
                ) : (
                  <p>{report.rawAnalysis?.consultationType || "Not specified"}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-2">Chief Complaint</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {report.pending ? (
                <p className="text-amber-500">Analyzing...</p>
              ) : (
                <p>{report.rawAnalysis?.chiefComplaint || "Not specified"}</p>
              )}
            </div>
          </div>
          
          {!report.pending && report.rawAnalysis?.otherComplaints?.length > 0 && (
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-2">Other Complaints</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc pl-5">
                  {report.rawAnalysis.otherComplaints.map((complaint, idx) => (
                    <li key={idx}>{complaint}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-2">History of Present Illness</h3>
            {report.pending ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-amber-500">Analyzing...</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                {report.rawAnalysis?.historyOfPresentIllness && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(report.rawAnalysis.historyOfPresentIllness).map(([key, value]) => (
                      value && value !== "" ? (
                        <div key={key} className="border-b border-gray-200 pb-2">
                          <p><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</p>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-2">Review of Systems</h3>
            {report.pending ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-amber-500">Analyzing...</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                {report.rawAnalysis?.reviewOfSymptoms && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(report.rawAnalysis.reviewOfSymptoms).map(([system, symptoms]) => (
                      <div key={system} className="mb-4">
                        <h4 className="font-medium mb-2 text-emerald-700">{system.charAt(0).toUpperCase() + system.slice(1)}</h4>
                        <ul className="list-disc pl-5">
                          {Object.entries(symptoms).map(([symptom, present]) => (
                            present === true ? (
                              <li key={symptom} className="text-red-600">
                                {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                              </li>
                            ) : null
                          ))}
                        </ul>
                        {Object.values(symptoms).every(v => v === false) && (
                          <p className="text-gray-600">No significant findings</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-2">Physical Examination</h3>
            {report.pending ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-amber-500">Analyzing...</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                {report.rawAnalysis?.physicalExamination && (
                  <div className="grid grid-cols-1 gap-6">
                    {Object.entries(report.rawAnalysis.physicalExamination).map(([system, findings]) => (
                      <div key={system} className="mb-4 border-b border-gray-200 pb-4">
                        <h4 className="font-medium mb-2 text-emerald-700">{system.charAt(0).toUpperCase() + system.slice(1)}</h4>
                        <div className="pl-5">
                          {Object.entries(findings).map(([finding, value]) => (
                            value && value !== "" ? (
                              <p key={finding}><strong>{finding.charAt(0).toUpperCase() + finding.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {value}</p>
                            ) : null
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-2">Pain Screening</h3>
            {report.pending ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-amber-500">Analyzing...</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                {report.rawAnalysis?.painScreening && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(report.rawAnalysis.painScreening).map(([key, value]) => (
                      value && value !== "" ? (
                        <div key={key} className="border-b border-gray-200 pb-2">
                          <p><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</p>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Assessment & Plan</h3>
            {report.pending ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-amber-500">Analyzing...</p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Assessment</h4>
                  <p>{report.rawAnalysis?.consultationDetails || "No assessment provided"}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Treatment Plan</h4>
                  <p>{report.rawAnalysis?.painScreening?.management || "No treatment plan provided"}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="font-semibold">Provider Signature: _____________________________</p>
            <p className="text-sm text-gray-600 mt-1">
              This report was generated using Vitalis EMR System with AI-assisted transcription technology. 
              While AI assists in document preparation, all medical content has been reviewed by a qualified healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMRReport;