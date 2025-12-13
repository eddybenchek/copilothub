"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Agent } from "@prisma/client";

export function AgentDownloadButton({ agent }: { agent: Agent }) {
  const [downloading, setDownloading] = useState(false);

  const downloadMarkdown = async () => {
    setDownloading(true);

    try {
      // Create formatted content with metadata
      const formattedContent = `# ${agent.title}
# Description: ${agent.description || "N/A"}
# Category: ${agent.category || "N/A"}
# Source: CopilotHub.com/agents/${agent.slug}

${agent.content}

---
# End of agent file
`;

      // Create blob and download
      const blob = new Blob([formattedContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${agent.slug}.agent.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Track download (fire and forget)
      fetch("/api/agents/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id }),
      }).catch(() => {
        // Silently fail - don't block user experience
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button 
      size="lg" 
      variant="outline" 
      onClick={downloadMarkdown}
      disabled={downloading}
    >
      <Download className="mr-2 h-5 w-5" />
      {downloading ? "Downloading..." : "Download .agent.md"}
    </Button>
  );
}

