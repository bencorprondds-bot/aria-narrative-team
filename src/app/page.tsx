"use client";

import Link from "next/link";
import { ArrowRight, Layout, Settings, Users, Plus, Loader2, Moon, Sun, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut, useSession, signIn } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";

interface WorkflowStub {
  id: string;
  name: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [workflows, setWorkflows] = useState<WorkflowStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugMsg, setDebugMsg] = useState("Initializing...");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (status === "authenticated") {
      setDebugMsg("Fetching workflows...");
      fetch('/api/workflows')
        .then(res => {
          setDebugMsg(`Fetch returned: ${res.status}`);
          if (res.status === 401) {
            throw new Error("Unauthorized");
          }
          return res.json();
        })
        .then(data => {
          setDebugMsg(`Data received: ${Array.isArray(data) ? data.length + " items" : JSON.stringify(data)}`);
          if (Array.isArray(data)) {
            setWorkflows(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch workflows", err);
          setDebugMsg(`Error: ${err.message}`);
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Layout className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">ARIA Studio</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Agentic Editorial Pipelines. Sign in to manage your workflows.
          </p>

          <button
            onClick={() => signIn("google")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans transition-colors dark:bg-gray-900 dark:text-gray-100">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Layout className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ARIA Studio</h1>
        </div>
        <div className="flex gap-4 text-sm text-gray-500 items-center dark:text-gray-400">
          <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
            {session?.user?.image && (
              <img src={session.user.image} alt={session.user.name || "User"} className="w-5 h-5 rounded-full" />
            )}
            <span className="font-medium text-xs text-gray-700 dark:text-gray-300">
              {session?.user?.name}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href="/setup" className="hover:text-blue-600 flex items-center gap-1">
            <Settings className="w-4 h-4" /> Setup
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {/* Debug Box */}
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs font-mono rounded border border-yellow-300">
          Current State: {loading ? "LOADING" : "DONE"} | {debugMsg} | User: {session?.user?.email}
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-light mb-2">Welcome back.</h2>
          <p className="text-gray-500">Select a workflow to manage your creative team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: New Project */}
          <Link href="/editor/new" className="group block">
            <div className="bg-white border text-center border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer h-full flex flex-col items-center justify-center gap-4 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/50">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold dark:text-gray-200">New Workflow</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start from a blank canvas</p>
              </div>
            </div>
          </Link>

          {/* Card: Interviews */}
          <Link href="/chat" className="group block">
            <div className="bg-white border text-center border-dashed border-gray-300 rounded-xl p-8 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer h-full flex flex-col items-center justify-center gap-4 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/50">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold dark:text-gray-200">Interview Agents</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Refine personas & prompts</p>
              </div>
            </div>
          </Link>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-48 col-span-1 md:col-span-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading workflows...
            </div>
          )}

          {/* Real Workflows */}
          {!loading && workflows.map((wf) => (
            <div key={wf.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50/50 dark:bg-gray-800 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300">Workflow</div>
                <Users className="text-gray-400 w-5 h-5 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1 truncate dark:text-gray-200" title={wf.name}>{wf.name}</h3>
              <p className="text-sm text-gray-500 mb-6 dark:text-gray-400">Last modified just now</p>
              <Link href={`/editor/${wf.id}`} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all dark:text-blue-400">
                Open Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}

          {!loading && workflows.length === 0 && (
            <div className="col-span-1 md:col-span-2 p-8 text-center text-gray-400 bg-gray-50 border rounded-xl dark:bg-gray-800/50 dark:border-gray-700">
              No saved workflows found.
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
