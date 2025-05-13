from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import whisper
import sounddevice as sd
import numpy as np
import json
import asyncio
from collections import deque
import requests
from fastapi.middleware.cors import CORSMiddleware
import logging
import re
# Enable CUDA if available
import torch
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL = whisper.load_model("medium.en", device=DEVICE)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SAMPLE_RATE = 16000
CHUNK_DURATION = 3
CHUNK_SIZE = SAMPLE_RATE * CHUNK_DURATION
BUFFER_DURATION = 10

class TranscriptionManager:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.audio_buffer = deque(maxlen=SAMPLE_RATE * BUFFER_DURATION)
        self.stop_streaming = False
        self.conversation_transcript = ""
        self.stream = None
        self.is_connected = True
        
    def audio_callback(self, indata, frames, time, status):
        if status:
            logger.warning(f"Audio callback status: {status}")
        try:
            # Convert to mono and add to buffer
            audio_data = indata[:, 0]
            self.audio_buffer.extend(audio_data)
        except Exception as e:
            logger.error(f"Error in audio callback: {e}")

    def start_audio_stream(self):
        logger.info("Starting audio stream...")
        try:
            if self.stream:
                try:
                    self.stream.stop()
                    self.stream.close()
                except Exception as e:
                    logger.error(f"Error closing existing stream: {e}")
                
            self.stream = sd.InputStream(
                samplerate=SAMPLE_RATE,
                channels=1,
                callback=self.audio_callback,
                blocksize=int(SAMPLE_RATE * 0.5)  # Process in 0.5-second chunks
            )
            self.stream.start()
            logger.info("Audio stream started successfully")
            return True
        except Exception as e:
            logger.error(f"Error starting audio stream: {e}")
            return False

    async def safe_send(self, data):
        if self.is_connected:
            try:
                await self.websocket.send_json(data)
                return True
            except Exception as e:
                logger.error(f"Error sending data: {e}")
                self.is_connected = False
                return False
        return False

    async def transcribe_audio(self):
        if not MODEL:
            logger.error("Whisper model not loaded")
            await self.safe_send({
                "type": "error",
                "message": "Transcription service not available"
            })
            return

        logger.info("Starting transcription loop")
        # Keep track of the last processed position
        last_processed = 0
        
        while not self.stop_streaming and self.is_connected:
            try:
                buffer_size = len(self.audio_buffer)
                if buffer_size >= CHUNK_SIZE and buffer_size - last_processed >= CHUNK_SIZE // 2:
                    # Extract audio chunk with 50% overlap from previous chunk
                    buffer_list = list(self.audio_buffer)
                    audio_chunk = np.array(buffer_list[last_processed:last_processed+CHUNK_SIZE], dtype=np.float32)
                    
                    # Update the last processed position with overlap
                    last_processed += CHUNK_SIZE // 2
                    # Ensure we don't go beyond buffer size
                    if last_processed > len(self.audio_buffer) - CHUNK_SIZE // 2:
                        last_processed = len(self.audio_buffer) - CHUNK_SIZE // 2
                    
                    # Skip silent sections
                    if np.abs(audio_chunk).mean() < 0.005:  # Threshold for silence
                        await asyncio.sleep(0.05)
                        continue
                    
                    # Normalize audio
                    if np.abs(audio_chunk).max() > 0:
                        audio_chunk = audio_chunk / np.abs(audio_chunk).max()
                    
                    # Transcribe asynchronously to avoid blocking the event loop
                    result = await asyncio.to_thread(lambda: MODEL.transcribe(
                        audio_chunk, 
                        fp16=False,
                        language="en",
                        beam_size=1,
                        best_of=1,
                        temperature=0
                    ))
                    
                    text = result["text"].strip()
                    
                    if text:
                        logger.info(f"Transcribed: {text}")
                        self.conversation_transcript += " " + text
                        
                        if not await self.safe_send({
                            "type": "transcription",
                            "text": text
                        }):
                            break
                            
                    # Instead of clearing the buffer, just prune it if it gets too large
                    if len(self.audio_buffer) > SAMPLE_RATE * BUFFER_DURATION * 1.5:
                        # Keep the most recent audio data
                        to_remove = len(self.audio_buffer) - (SAMPLE_RATE * BUFFER_DURATION)
                        for _ in range(to_remove):
                            self.audio_buffer.popleft()
                        # Adjust last_processed
                        last_processed = max(0, last_processed - to_remove)
                    
                    # Allow other tasks to run
                    await asyncio.sleep(0.01)
                else:
                    # Don't burn CPU when waiting for more audio
                    await asyncio.sleep(0.1)
                    
            except Exception as e:
                logger.error(f"Error in transcription: {e}")
                await self.safe_send({
                    "type": "error",
                    "message": "Transcription error occurred"
                })
                break

    async def stop_recording(self):
        logger.info("Stopping recording")
        self.stop_streaming = True
        if self.stream:
            try:
                self.stream.stop()
                self.stream.close()
            except Exception as e:
                logger.error(f"Error stopping stream: {e}")
        
        if self.conversation_transcript.strip():
            await self.process_final_transcript()

    async def process_final_transcript(self):
        if not self.is_connected:
            return

        if not self.conversation_transcript.strip():
            await self.safe_send({
                "type": "error",
                "message": "No conversation recorded"
            })
            return

        logger.info("Processing final transcript")
        logger.info(f"Conversation transcript: {self.conversation_transcript}")

        try:
            logger.info("Sending request to OpenRouter API")
            response = await asyncio.to_thread(
                lambda: requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    json={
                        "model": "qwen/qwen2.5-vl-72b-instruct:free",
                        "messages": [
                            {
                                "role": "system",
                                "content": """You are a medical professional analyzing doctor-patient conversations. You must respond ONLY with a valid JSON object containing the following fields. DO NOT include any other text or explanations.

Required JSON structure:
{
    "consultationDetails": "string",
    "consultationType": "string",
    "chiefComplaint": "string",
    "otherComplaints": ["string"],
    "historyOfPresentIllness": {
        "location": "string",
        "duration": "string",
        "quality": "string",
        "timing": "string",
        "severity": "string",
        "associatedSignsSymptoms": "string",
        "other": "string"
    },
    "reviewOfSymptoms": {
        "constitutional": {
            "fever": false,
            "chills": false,
            "nightSweats": false,
            "fatigue": false
        },
        "neurological": {
            "headache": false,
            "numbness": false,
            "weakness": false,
            "dizziness": false
        },
        "cardiovascular": {
            "chestPain": false,
            "palpitations": false,
            "dyspnea": false,
            "heartbeatIrregular": false
        },
        "musculoskeletal": {
            "arthralgias": false,
            "myalgias": false,
            "swellingInJoints": false,
            "other": false
        }
    },
    "physicalExamination": {
        "constitutional": {
            "recordThreeVitalSigns": "string",
            "nutritionGood": "string",
            "appearance": "string",
            "other": "string"
        },
        "neurological": {
            "focalNeuroDeficits": "string",
            "asterixis": "string",
            "other": "string"
        },
        "cardiovascular": {
            "heartSoundsAbnormal": "string",
            "pulseHeartRhythmAbnormal": "string",
            "peripheralEdema": "string",
            "other": "string"
        },
        "musculoskeletal": {
            "normalGaitAndStation": "string",
            "clubbing": "string",
            "muscleWeakness": "string",
            "other": "string"
        }
    },
    "painScreening": {
        "pain": "string",
        "location": "string",
        "duration": "string",
        "frequency": "string",
        "character": "string",
        "score": "string",
        "management": "string"
    }
}

Rules:
1. ONLY output valid JSON - no other text
2. ALL fields must be included
3. Use empty strings "" for unknown text fields
4. Use false for unknown boolean fields
5. Use empty arrays [] for unknown array fields
6. ALL property names must be in double quotes
7. ALL string values must be in double quotes
8. Boolean values must be true or false (no quotes)
9. Ensure proper nesting and closing of all brackets
10. No trailing commas
11. No comments or explanations
12. No line breaks in string values - use \\n if needed"""
                            },
                            {
                                "role": "user",
                                "content": f"Analyze this doctor-patient conversation and create a detailed EMR report:\n\n{self.conversation_transcript}"
                            }
                        ],
                        "response_format": { "type": "json_object" },
                        "temperature": 0.1,
                        "max_tokens": 2000
                    },
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://github.com/OpenRouterTeam/openrouter",
                        "X-Title": "Vitalis Medical Transcription"
                    },
                    timeout=30
                )
            )
            
            # Log the raw response for debugging
            logger.info(f"Raw API response: {response.text}")
            
            # Check response status
            response.raise_for_status()
            
            # Parse response JSON
            response_data = response.json()
            logger.info(f"Parsed response data: {response_data}")
            
            # Validate response structure
            if 'choices' not in response_data:
                raise ValueError(f"Missing 'choices' in API response: {response_data}")
            
            if not response_data['choices'] or 'message' not in response_data['choices'][0]:
                raise ValueError(f"Invalid response structure: {response_data}")
            
            result = response_data['choices'][0]['message']['content']
            logger.info(f"Extracted content: {result}")
            
            # Validate and clean the result
            if not result.strip():
                raise ValueError("Empty result from API")
            
            # Clean the JSON string
            result = result.strip()
            if not result.startswith('{'):
                start_idx = result.find('{')
                if start_idx == -1:
                    raise ValueError(f"No JSON object found in result: {result}")
                result = result[start_idx:]
            if not result.endswith('}'):
                end_idx = result.rfind('}')
                if end_idx == -1:
                    raise ValueError(f"No closing brace found in result: {result}")
                result = result[:end_idx + 1]
            
            # Parse the cleaned JSON
            analysis = json.loads(result)
            
            # Create the response data structure
            response_data = {
                "type": "final_analysis",
                "shouldNavigate": True,
                "analysis": analysis
            }

            # Send to frontend
            await self.safe_send(response_data)
            logger.info("EMR data sent successfully")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request error: {e}")
            await self.safe_send({
                "type": "error",
                "message": "Failed to connect to the transcription service. Please try again."
            })
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"Problematic JSON: {result}")
            await self.safe_send({
                "type": "error",
                "message": "Failed to parse the generated EMR data. Please try again."
            })
        except ValueError as e:
            logger.error(f"Validation error: {e}")
            await self.safe_send({
                "type": "error",
                "message": f"Invalid response from transcription service: {str(e)}"
            })
        except Exception as e:
            logger.error(f"Error processing transcript: {e}")
            await self.safe_send({
                "type": "error",
                "message": "Failed to process transcription. Please try again."
            })

    def cleanup(self):
        logger.info("Cleaning up resources")
        self.stop_streaming = True
        self.is_connected = False
        if self.stream:
            try:
                self.stream.stop()
                self.stream.close()
            except:
                pass

@app.websocket("/transcription")
async def transcription_endpoint(websocket: WebSocket):
    client_id = id(websocket)
    logger.info(f"New WebSocket connection request from client {client_id}")
    
    try:
        await websocket.accept()
        logger.info(f"WebSocket connection accepted for client {client_id}")
        
        manager = TranscriptionManager(websocket)
        transcription_task = None
        
        try:
            while True:
                try:
                    data = await websocket.receive_json()
                    command = data.get("command")
                    logger.info(f"Received command '{command}' from client {client_id}")
                    
                    if command == "start":
                        # Stop any existing recording
                        if transcription_task:
                            manager.stop_streaming = True
                            try:
                                await transcription_task
                            except:
                                pass
                        
                        # Start new recording
                        manager.stop_streaming = False
                        manager.conversation_transcript = ""
                        if manager.start_audio_stream():
                            transcription_task = asyncio.create_task(manager.transcribe_audio())
                            logger.info(f"Started new transcription task for client {client_id}")
                        else:
                            await manager.safe_send({
                                "type": "error",
                                "message": "Failed to start recording"
                            })
                    
                    elif command == "stop":
                        if transcription_task:
                            await manager.stop_recording()
                            transcription_task = None
                            logger.info(f"Stopped transcription for client {client_id}")
                            
                    elif command == "generate_emr":
                        # Get the transcript from the message
                        transcript = data.get("transcript", "")
                        
                        if transcript:
                            # Use the existing transcript if provided, otherwise use what we've collected
                            if not manager.conversation_transcript:
                                manager.conversation_transcript = transcript
                            
                            # Process the transcript
                            await manager.process_final_transcript()
                            logger.info(f"Generated EMR for client {client_id}")
                        else:
                            await manager.safe_send({
                                "type": "error",
                                "message": "No transcript provided for EMR generation"
                            })
                
                except WebSocketDisconnect:
                    logger.info(f"WebSocket disconnected for client {client_id}")
                    break
                except Exception as e:
                    logger.error(f"Error handling command for client {client_id}: {e}")
                    break
        
        except Exception as e:
            logger.error(f"WebSocket error for client {client_id}: {e}")
        
        finally:
            logger.info(f"Cleaning up connection for client {client_id}")
            manager.cleanup()
            if transcription_task:
                try:
                    await transcription_task
                except:
                    pass
    
    except Exception as e:
        logger.error(f"Error accepting WebSocket connection for client {client_id}: {e}")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting transcription server")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")