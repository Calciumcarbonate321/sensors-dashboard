'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LiveDataFeed from "@/components/live-feed"
import { useState, useEffect } from "react"

interface SensorData {
  temperature: number
  humidity: number
  pressure: number
}

interface PredictionResponse {
  prediction: string
}

export default function Home() {
  const [prediction1, setPrediction1] = useState<string | null>(null)
  const [prediction2, setPrediction2] = useState<string | null>(null)
  const [sensorData1, setSensorData1] = useState<SensorData | null>(null)
  const [sensorData2, setSensorData2] = useState<SensorData | null>(null)

  useEffect(() => {
    const fetchSensorData = async (id: string, setSensorData: React.Dispatch<React.SetStateAction<SensorData | null>>) => {
      try {
        const response = await fetch(`/api/clients/${id}`)
        const data = await response.json()
        setSensorData(data)
      } catch (error) {
        console.error('Error fetching sensor data:', error)
      }
    }

    fetchSensorData("hehe", setSensorData1)
    fetchSensorData("nothehe", setSensorData2)

    const interval = setInterval(() => {
      fetchSensorData("hehe", setSensorData1)
      fetchSensorData("nothehe", setSensorData2)
    }, 3000) 
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const getPrediction = async (
      sensorData: SensorData | null,
      setPrediction: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
      if (!sensorData) return

      try {
        const response = await fetch('/api/prediction/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sensorData)
        })

        if (!response.ok) {
          throw new Error('Failed to get prediction')
        }

        const data: PredictionResponse = await response.json()
        setPrediction(data.prediction)
      } catch (error) {
        console.error('Error getting prediction:', error)
        setPrediction('Failed to get prediction')
      }
    }

    const updatePredictions = () => {
      getPrediction(sensorData1, setPrediction1)
      getPrediction(sensorData2, setPrediction2)
    }

    updatePredictions()
    const interval = setInterval(updatePredictions, 60000) 

    return () => clearInterval(interval)
  }, [sensorData1, sensorData2]) 

  const PredictionCard = ({ title, sensorData, prediction }: { 
    title: string, 
    sensorData: SensorData | null,
    prediction: string | null 
  }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {sensorData ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">
                Temperature: <span className="font-semibold">{sensorData.temperature.toFixed(1)}°C</span>
              </p>
              <p className="text-sm">
                Humidity: <span className="font-semibold">{sensorData.humidity.toFixed(1)}%</span>
              </p>
              <p className="text-sm">
                Pressure: <span className="font-semibold">{sensorData.pressure.toFixed(1)} hPa</span>
              </p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">Prediction:</p>
              <p className="text-sm text-muted-foreground">
                {prediction || 'Loading prediction...'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading sensor data...</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <PredictionCard 
            title="Sensor 'hehe'" 
            sensorData={sensorData1} 
            prediction={prediction1}
          />
          <LiveDataFeed id="hehe" />
        </div>
        <div>
          <PredictionCard 
            title="Sensor 'nothehe'" 
            sensorData={sensorData2}
            prediction={prediction2}
          />
          <LiveDataFeed id="nothehe" />
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'