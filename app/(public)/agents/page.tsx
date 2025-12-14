import { AgentsClient } from './agents-client';

export const metadata = {
  title: 'AI Agents - GitHub Copilot Agents Directory',
  description: 'Browse specialized AI agents for GitHub Copilot to enhance your development workflow',
};

export default function AgentsPage() {
  return <AgentsClient />;
}
