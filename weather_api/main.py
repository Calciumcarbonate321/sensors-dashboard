from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from typing import Optional
from model.train import preprocess_data

# Initialize FastAPI app
app = FastAPI(title="Weather Prediction API")

# Add CORS middleware to allow requests from your friend's Vercel app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your friend's Vercel app URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request data model
class SensorData(BaseModel):
    temperature: float
    humidity: float
    pressure: float

# Load the trained model
def load_model():
    try:
        with open('model/weather_model.pkl', 'rb') as f:
            return pickle.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Model not found. Please train the model first.")

model = load_model()

@app.get("/")
async def root():
    return {"message": "Weather Prediction API is running. Send POST requests to /predict"}

@app.post("/predict")
async def predict_weather(data: SensorData):
    try:
        # Create DataFrame for prediction
        input_data = pd.DataFrame({
            'temperature': [data.temperature],
            'humidity': [data.humidity],
            'pressure': [data.pressure]
        })
        
        # Validate input ranges
        if not (0 <= data.humidity <= 100):
            raise HTTPException(status_code=400, detail="Humidity must be between 0 and 100%")
        if not (-20 <= data.temperature <= 50):
            raise HTTPException(status_code=400, detail="Temperature must be between -20°C and 50°C")
        if not (900 <= data.pressure <= 1100):
            raise HTTPException(status_code=400, detail="Pressure must be between 900 and 1100 hPa")
        
        # Preprocess the input data
        processed_data = preprocess_data(input_data)
        
        # Make prediction
        prediction = model.predict(processed_data)[0]
        
        # Return prediction as plain text
        return prediction
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For local testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)