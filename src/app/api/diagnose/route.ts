import { NextResponse } from 'next/server';
import { driveClient } from '@/lib/drive';

export async function GET() {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    try {
        log("🔍 Starting Drive Diagnosis (API Mode)...");

        // 1. Root
        log("1. Finding Root Folder (Life with AI)...");
        const root = await driveClient.findFolder('Life with AI');
        if (!root) {
            log("❌ Root folder NOT found!");
            return NextResponse.json({ logs });
        }
        log(`✅ Found Root: ${root.id}`);

        // 2. System
        if (!root?.id) throw new Error("Root folder has no ID");
        log("2. Finding System Folder (00_System)...");
        const system = await driveClient.findFolder('00_System', root.id);
        if (!system) {
            log("❌ '00_System' NOT found!");
            return NextResponse.json({ logs });
        }
        log(`✅ Found System: ${system.id}`);

        // 3. Workflows
        if (!system?.id) throw new Error("System folder has no ID");
        log("3. Finding Workflows Folder...");
        const workflows = await driveClient.findFolder('Workflows', system.id);
        if (!workflows) {
            log("❌ 'Workflows' folder NOT found!");
            return NextResponse.json({ logs });
        }
        log(`✅ Found Workflows Folder: ${workflows.id}`);

        // 4. Files
        if (!workflows?.id) throw new Error("Workflows folder has no ID");
        log("4. Listing Files in Workflows...");
        const files = await driveClient.listFiles(workflows.id);
        log(`📂 Found ${files.length} files:`);
        files.forEach(f => {
            log(`   - [${f.mimeType}] ${f.name} (${f.id})`);
        });

        return NextResponse.json({ logs, success: true });

    } catch (e: any) {
        log(`🔥 CRITICAL ERROR: ${e.message}`);
        return NextResponse.json({ logs, error: e.message }, { status: 500 });
    }
}
