"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Instruction } from "@prisma/client";

export function DownloadButton({ instruction }: { instruction: Instruction }) {
  const [downloading, setDownloading] = useState(false);

  const downloadMarkdown = async () => {
    setDownloading(true);

    try {
      // Create formatted content with metadata
      const formattedContent = `# ${instruction.title}
# File Pattern: ${instruction.filePattern || "N/A"}
# Language: ${instruction.language || "N/A"}
# Framework: ${instruction.framework || "N/A"}
# Source: CopilotHub.com/instructions/${instruction.slug}

${instruction.content}

---
# End of instruction
`;

      // Create blob and download
      const blob = new Blob([formattedContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `copilot-instructions-${instruction.slug}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Track download (fire and forget)
      fetch("/api/instructions/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructionId: instruction.id }),
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
      {downloading ? "Downloading..." : "Download .md"}
    </Button>
  );
}

