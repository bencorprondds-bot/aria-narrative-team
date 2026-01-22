import { NextResponse } from 'next/server';
import { folderManager } from '@/lib/folders';

export async function POST() {
    const result = await folderManager.ensureStructure();
    return NextResponse.json(result);
}
