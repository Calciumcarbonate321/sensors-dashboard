'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts'
import type { sensorData } from '@/lib/types/sensorData'

interface Props {
  id: string
}

// Extended sensor data type that includes timestamp
interface TimeSeriesSensorData extends sensorData {
  time: string
}

// Custom type for tooltip payload
interface CustomTooltipPayload {
  value: number
  name: string
  color: string
  unit: string
}

// Props type for custom tooltip
interface CustomTooltipProps extends Omit<TooltipProps<number, string>, 'payload'> {
  payload?: CustomTooltipPayload[]
}

export default function LiveDataFeed(props: Props) {
  const [messages, setMessages] = useState<TimeSeriesSensorData[]>([])
  const id = props.id

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/clients/' + id)
        const data = await response.json()
        const timestamp = new Date().toLocaleTimeString()
        setMessages(prevMessages => [...prevMessages, { ...data, time: timestamp }])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [id])

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)}${entry.unit}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ESP32 client id: {id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Temperature Chart */}
          <div className="h-64">
            <h3 className="text-lg font-semibold mb-2">Temperature (°C)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ff6b6b" 
                  name="Temperature"
                  unit="°C"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Humidity Chart */}
          <div className="h-64">
            <h3 className="text-lg font-semibold mb-2">Humidity (%)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#4ecdc4" 
                  name="Humidity"
                  unit="%"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pressure Chart */}
          <div className="h-64">
            <h3 className="text-lg font-semibold mb-2">Pressure (hPa)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="pressure" 
                  stroke="#45b7d1" 
                  name="Pressure"
                  unit=" hPa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const dynamic = 'force-dynamic'