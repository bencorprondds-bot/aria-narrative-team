'use client';
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SetupPage() {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
    const [loading, setLoading] = useState(false);

    const runSetup = async () => {
        setLoading(true);
        setLogs(["Starting setup..."]);
        try {
            const res = await fetch('/api/setup', { method: 'POST' });
            const data = await res.json();
            setLogs(prev => [...prev, ...data.logs, data.success ? "Setup Complete!" : "Setup Failed"]);
            if (res.ok && data.success) {
                setLogs(prev => [...prev, ...data.logs, "Setup Complete!"]);
                setStatus('complete'); // Set status to complete on success
            } else {
                setLogs(prev => [...prev, ...data.logs, "Setup Failed"]);
                setStatus('error'); // Set status to error on failure
            }
        } catch (e: any) {
            setLogs(prev => [...prev, "Error: " + e.message]);
            setStatus('error'); // Set status to error on exception
        }
    };

    if (!session) {
        return (
            <div className="flex h-screen items-center justify-center">
                <button
                    onClick={() => signIn('google')}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Sign in with Google to Setup ARIA
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">ARIA Studio Setup</h1>
            <p className="mb-4 text-gray-600">Connected as {session.user?.email}</p>

            <button
                onClick={runSetup}
                disabled={loading}
                className="mb-6 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? "Initializing..." : "Initialize Folder Structure"}
            </button>

            <div className="bg-gray-100 p-4 rounded h-96 overflow-auto font-mono text-sm">
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>

            {status === 'complete' && (
                <Link href="/" className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Go to Studio <ArrowRight className="w-4 h-4" />
                </Link>
            )}

            <button onClick={() => signOut()} className="mt-4 text-sm text-red-500 underline block">
                Sign out
            </button>
        </div>
    );
}
