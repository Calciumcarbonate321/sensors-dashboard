from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Weather Prediction API is running. Send POST requests to /predict"}

def test_predict_weather():
    response = client.post(
        "/predict",
        json={"temperature": 25.0, "humidity": 65.0, "pressure": 1013.25}
    )
    assert response.status_code == 200
    assert response.text in ["sunny", "rainy", "cloudy"]

def test_invalid_humidity():
    response = client.post(
        "/predict",
        json={"temperature": 25.0, "humidity": 101.0, "pressure": 1013.25}
    )
    assert response.status_code == 400