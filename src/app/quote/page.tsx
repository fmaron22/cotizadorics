import { ChatContainer } from "@/components/chat/ChatContainer";

export default function QuotePage() {
    return (
        <main className="flex min-h-screen flex-col bg-background overflow-hidden">
            <header className="h-20 border-b border-border/40 p-4 backdrop-blur-md bg-background/80 fixed w-full top-0 z-10 flex items-center">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                        ID-Secure Quoter
                    </h1>
                </div>
            </header>

            <div className="container mx-auto mt-20 h-[calc(100vh-5rem)] max-w-3xl border-x border-border/20 shadow-2xl shadow-black/50 flex flex-col">
                <ChatContainer />
            </div>
        </main>
    );
}
