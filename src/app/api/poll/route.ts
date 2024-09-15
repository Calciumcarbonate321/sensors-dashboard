import { NextResponse } from "next/server";
import getRedisClient from "@/lib/redis";

export async function GET() {
    const client = getRedisClient();
    const temperature = await client.get('hehe:temperature');
    const humidity = await client.get('hehe:humidity');
    const pressure = await client.get('hehe:pressure');
    
    const data = {
        temperature,
        humidity,
        pressure
    };

    return NextResponse.json(JSON.stringify(data));
}

export const dynamic = 'force-dynamic';