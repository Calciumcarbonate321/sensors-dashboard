import { NextResponse, type NextRequest } from "next/server";
import type { sensorData } from "@/lib/types/sensorData";

import getRedisClient from "@/lib/redis";

type Params = {
    params: {
        id: string;
    };
};

export async function GET(
    request: NextRequest,
    { params }: Params
) {
    const id = params.id;

    const client = getRedisClient();
    const temperature = await client.get(`${id}:temperature`);
    const humidity = await client.get(`${id}:humidity`);
    const pressure = await client.get(`${id}:pressure`);

    const data: sensorData = {
        temperature: parseFloat(temperature ?? '0'),
        humidity: parseFloat(humidity ?? '0'),
        pressure: parseFloat(pressure ?? '0')
    };

    return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: Params) {
    const id = params.id;
    const {
        temperature,
        humidity,
        pressure
    } = await request.json();
    const client = getRedisClient();
    await client.set(`${id}:temperature`, temperature);
    await client.set(`${id}:humidity`, humidity);
    await client.set(`${id}:pressure`, pressure);
    return NextResponse.json({ success: true });
}