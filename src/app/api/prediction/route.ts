// app/api/prediction/[id]/route.ts
import { type NextRequest, NextResponse } from 'next/server'

interface SensorData {
  temperature: number
  humidity: number
  pressure: number
}

interface PredictionResponse {
  prediction: string
}

export async function POST(request: NextRequest) {
  try {
    const sensorData: SensorData = await request.json()

    if (!sensorData.temperature || !sensorData.humidity || !sensorData.pressure) {
      return NextResponse.json(
        { error: 'Missing required sensor data' },
        { status: 400 }
      )
    }

    const response = await fetch(`${process.env.PREDICTION_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        pressure: sensorData.pressure
      })
    })

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`)
    }

    const predictionData: PredictionResponse = await response.json()
    return NextResponse.json({ prediction: predictionData })

  } catch (error) {
    console.error('Error getting weather prediction:', error)
    return NextResponse.json(
      { error: 'Failed to get weather prediction' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Weather prediction service is running' })
}