import { type NextRequest, NextResponse } from "next/server";
import getRedisClient from "@/lib/redis";

export async function POST(request: NextRequest) {
    const { sensorId,
        temperature,
        humidity,
        pressure
    } = await request.json();
    const client = getRedisClient();
    await client.set(sensorId+":temperature", temperature);
    await client.set(sensorId+":humidity", humidity);
    await client.set(sensorId+":pressure", pressure);
    return NextResponse.json({ success: true });
}