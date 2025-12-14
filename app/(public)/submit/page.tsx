import { redirect } from 'next/navigation';

const GITHUB_REPO_URL = 'https://github.com/eddybenchek/copilothub';

export default function SubmitPage() {
  redirect(GITHUB_REPO_URL);
}
