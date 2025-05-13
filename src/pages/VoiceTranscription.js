import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, StopCircle } from 'lucide-react';
import './VoiceTranscription.css';

const VoiceTranscription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [emrReport, setEmrReport] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wsRef = useRef(null);

  // Sample patient data (in a real app, this would come from your database)
  const patientData = {
    app1: { name: "John Doe", age: "45", gender: "Male" },
    app2: { name: "Jane Smith", age: "38", gender: "Female" },
    app3: { name: "Robert Johnson", age: "62", gender: "Male" },
    // Add more as needed
  };

  // Initialize WebSocket connection
  useEffect(() => {
    // Clean up function
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setError(null);
    const ws = new WebSocket('ws://localhost:8000/transcription');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);

      switch (data.type) {
        case 'transcription':
          setTranscript(prev => prev + ' ' + data.text);
          break;
        case 'error':
          setError(data.message);
          setIsProcessing(false);
          setIsRecording(false);
          break;
        case 'final_analysis':
          setIsProcessing(false);
          if (data.analysis) {
            // Convert server analysis to frontend format
            const analysis = data.analysis;
            
            const mockReport = {
              patientInfo: {
                name: patientData[appointmentId]?.name || "Unknown Patient",
                age: patientData[appointmentId]?.age || "Unknown",
                gender: patientData[appointmentId]?.gender || "Not specified"
              },
              chiefComplaint: analysis.chiefComplaint || "Not specified",
              history: analysis.historyOfPresentIllness ? 
                Object.entries(analysis.historyOfPresentIllness)
                  .filter(([_, value]) => value && value !== "")
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n") : 
                "No history provided",
              examination: analysis.physicalExamination ? 
                Object.entries(analysis.physicalExamination)
                  .map(([system, details]) => {
                    if (typeof details === 'object') {
                      return `${system}: ${Object.entries(details)
                        .filter(([_, value]) => value && value !== "")
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}`;
                    }
                    return `${system}: ${details}`;
                  })
                  .filter(text => !text.endsWith(": "))
                  .join("\n") : 
                "No examination details",
              assessment: analysis.consultationDetails || "No assessment provided",
              plan: analysis.painScreening?.management || "No treatment plan provided"
            };
            
            setEmrReport(mockReport);
            
            // If the server indicates navigation should happen
            if (data.shouldNavigate) {
              // You could navigate or just show the report
            }
          }
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      if (isRecording) {
        setError('Connection to transcription service lost. Please try again.');
        setIsRecording(false);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to transcription service. Please ensure the server is running.');
      setIsRecording(false);
    };
  };

  const startRecording = async () => {
    try {
      // Connect to WebSocket
      connectWebSocket();
      
      // Get audio for local playback
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorderRef.current.start();
      
      // Tell the server to start recording
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ command: "start" }));
      } else {
        throw new Error("WebSocket not connected");
      }
      
      setIsRecording(true);
      setTranscript('');
      setEmrReport(null);
      setError(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Unable to start recording. Please check permissions and ensure the server is running.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Tell the server to stop recording and process
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ command: "stop" }));
        setIsProcessing(true);
      }

      setIsRecording(false);
    }
  };

  const generateEMR = () => {
    if (!transcript) return;
    setIsProcessing(true);
    
    // Tell the server to generate EMR
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        command: "generate_emr",
        transcript: transcript  // Send the transcript for processing
      }));
      
      // After a slight delay to ensure processing has started
      setTimeout(() => {
        // Generate a unique report ID
        const reportId = `report_${Date.now()}`;
        
        // Create a simple EMR report from available data
        const tempReport = {
          patientInfo: {
            name: patientData[appointmentId]?.name || "Unknown Patient",
            age: patientData[appointmentId]?.age || "Unknown",
            gender: patientData[appointmentId]?.gender || "Not specified"
          },
          transcript: transcript,
          pending: true  // Mark as pending so the EMR page knows to update it
        };
        
        // Save to localStorage
        const savedReports = JSON.parse(localStorage.getItem('emrReports') || '{}');
        savedReports[reportId] = tempReport;
        localStorage.setItem('emrReports', JSON.stringify(savedReports));
        
        // Navigate to the report page which will show loading state
        navigate(`/emr-report/${reportId}`);
      }, 500);
    } else {
      setError("WebSocket not connected. Please refresh the page and try again.");
      setIsProcessing(false);
    }
  };

  const saveEMR = () => {
    if (!emrReport) return;

    // Generate a unique report ID (in production, your backend would do this)
    const reportId = `report_${Date.now()}`;
    
    // Save to localStorage (in production, this would be a backend API call)
    const savedReports = JSON.parse(localStorage.getItem('emrReports') || '{}');
    savedReports[reportId] = emrReport;
    localStorage.setItem('emrReports', JSON.stringify(savedReports));
    
    // Navigate to the report page
    navigate(`/emr-report/${reportId}`);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="ml-1">Back</span>
        </button>
        
        <h1 className="text-2xl font-bold mb-6">Appointment Recording</h1>
        <div className="text-sm text-gray-600 mb-6">Appointment ID: {appointmentId}</div>
        
        <div className="flex justify-center mb-8">
          <button
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all
              ${isRecording 
                ? 'bg-red-500 text-white shadow-lg shadow-red-300 recording-pulse' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            {isRecording ? (
              <>
                <StopCircle className="h-12 w-12 mb-2" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="h-12 w-12 mb-2" />
                <span>Record</span>
              </>
            )}
          </button>
        </div>
        
        {audioUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Review Recording</h3>
            <audio 
              controls 
              src={audioUrl} 
              className="w-full max-w-md mx-auto"
            ></audio>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Transcription</h3>
          <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm">
            {transcript ? transcript : "Transcription will appear here..."}
          </div>
        </div>
        
        {error && (
          <div className="mb-6 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          <button
            className={`px-6 py-2 rounded-lg font-medium flex items-center justify-center
              ${isProcessing || !transcript || isRecording
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            onClick={generateEMR}
            disabled={isProcessing || !transcript || isRecording}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : "Generate EMR Report"}
          </button>
          
          <button
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
            onClick={() => navigate('/appointments')}
            disabled={isRecording || isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>

      {emrReport && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold mb-6">Generated EMR Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Name:</strong> {emrReport.patientInfo.name}</p>
                <p><strong>Age:</strong> {emrReport.patientInfo.age}</p>
                <p><strong>Gender:</strong> {emrReport.patientInfo.gender}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Chief Complaint</h3>
              <div className="bg-gray-50 p-4 rounded-lg h-full">
                <p>{emrReport.chiefComplaint}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">History</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{emrReport.history}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Examination</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{emrReport.examination}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Assessment</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{emrReport.assessment}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Plan</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{emrReport.plan}</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              onClick={saveEMR}
              disabled={isProcessing}
            >
              Save EMR Report
            </button>
            <button
              className="px-6 py-2 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium"
              onClick={() => setEmrReport(null)}
            >
              Edit Transcript
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTranscription;