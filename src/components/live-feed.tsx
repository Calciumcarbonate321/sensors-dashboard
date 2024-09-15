'use client'

import { useState, useEffect, useRef } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function LiveDataFeed() {
  const [messages, setMessages] = useState<string[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/poll')
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
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Textarea
        value={currentMessage}
        readOnly
        className="w-full h-20 resize-none"
        placeholder="Waiting for new data..."
      />
      <ScrollArea className="h-80 w-full border rounded-md p-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.slice().reverse().map((message, index) => (
            <div key={index} className="bg-muted p-2 rounded-md text-black">
              {message}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export const dynamic = 'force-dynamic';