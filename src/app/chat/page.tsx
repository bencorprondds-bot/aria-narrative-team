import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
    return (
        <div className="h-screen flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-3 z-10">
                <h1 className="text-lg font-bold">Agent Interviews</h1>
            </header>
            <div className="flex-1 overflow-hidden">
                <ChatInterface />
            </div>
        </div>
    );
}
