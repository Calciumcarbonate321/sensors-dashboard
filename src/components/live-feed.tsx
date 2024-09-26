'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ScrollArea } from "@/components/ui/scroll-area"
import type { sensorData } from '@/lib/types/sensorData'

interface props {
  id: string
}

export default function LiveDataFeed(props:props) {
  const [messages, setMessages] = useState<sensorData[]>([])
  const [currentMessage, setCurrentMessage] = useState<sensorData | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const id = props.id

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/clients/' + id)
        const data = await response.json()
        setMessages(prevMessages => [...prevMessages, data])
        setCurrentMessage(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const interval = setInterval(fetchData, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Scroll to top when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0
    }
  }, [messages])

  const rendersensorData = (data: sensorData) => (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <span className="font-semibold">Temp:</span> {data.temperature.toFixed(1)}°C
      </div>
      <div>
        <span className="font-semibold">Humidity:</span> {data.humidity.toFixed(1)}%
      </div>
      <div>
        <span className="font-semibold">Pressure:</span> {data.pressure.toFixed(1)} hPa
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ESP32 client id: {id}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Latest Sensor Data</h2>
          {currentMessage && rendersensorData(currentMessage)}
        </CardContent>
      </Card>
      <ScrollArea className="h-80 w-full border rounded-md p-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.map((message, index) => (
            <Card key={index} className="mb-2">
              <CardContent className="p-2">
                <div className="text-sm text-muted-foreground mb-1">
                  {new Date().toLocaleTimeString()}
                </div>
                {rendersensorData(message)}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export const dynamic = 'force-dynamic';