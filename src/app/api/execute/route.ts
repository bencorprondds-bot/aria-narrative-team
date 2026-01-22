import { NextResponse } from 'next/server';
import { executionService } from '@/lib/execution';

// Increase timeout if possible, but Vercel functions have limits. 
// For local dev, this is fine.
export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
    try {
        const { workflowId, input } = await req.json();

        if (!workflowId) return NextResponse.json({ error: "Missing workflowId" }, { status: 400 });

        const result = await executionService.executeWorkflow(workflowId, input || "Begin processing.");
        return NextResponse.json(result);
    } catch (e: any) {
        console.error("Execution Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
