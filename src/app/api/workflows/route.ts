import { NextResponse } from 'next/server';
import { workflowService } from '@/lib/workflows';

export async function GET() {
    try {
        const list = await workflowService.listWorkflows();
        return NextResponse.json(list);
    } catch (e: any) {
        console.error("GET Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, nodes, edges } = body;
        const result = await workflowService.createWorkflow(name, nodes, edges);
        console.log("API Create Result:", result);
        return NextResponse.json(result);
    } catch (e: any) {
        console.error("POST Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
