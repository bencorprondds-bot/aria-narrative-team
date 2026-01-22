import { NextResponse } from 'next/server';
import { geminiClient } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const { message, systemInstruction, history } = await req.json();

        const response = await geminiClient.chat(message, systemInstruction, history);

        return NextResponse.json({ response });
    } catch (e: any) {
        console.error("Chat Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
