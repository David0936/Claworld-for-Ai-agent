"use client";

import { useState } from "react";
import { Dock } from "@/components/Dock";
import { TopBar } from "@/components/TopBar";
import { StatusBar } from "@/components/StatusBar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Dock onChatToggle={() => setChatOpen((v) => !v)} />
      <div
        style={{
          marginLeft: isMobile ? 0 : "200px",
          marginTop: isMobile ? "48px" : "56px",
          marginBottom: isMobile ? "60px" : "32px",
          flex: 1,
          minWidth: 0,
        }}
      >
        <TopBar />
        <main
          style={{
            padding: isMobile ? "16px" : "24px 32px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {children}
        </main>
      </div>
      <StatusBar />
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
