import { NextResponse } from 'next/server';
import { promptService } from '@/lib/prompts';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });

    try {
        const prompt = await promptService.getPrompt(agentId);
        return NextResponse.json({ prompt });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { agentId, content } = await req.json();
        await promptService.savePrompt(agentId, content);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
