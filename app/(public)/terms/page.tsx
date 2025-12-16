import { Metadata } from 'next';
import { FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service - CopilotHub',
  description: 'Terms of Service for CopilotHub - Read our terms and conditions for using the platform.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-lg bg-blue-500/20 p-3">
              <FileCheck className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-50">Terms of Service</h1>
          <p className="text-sm text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">
                By accessing or using CopilotHub (&quot;the Service&quot;), you agree to be bound by these Terms of Service 
                (&quot;Terms&quot;). If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Use License</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed mb-4">
                Permission is granted to temporarily access and use CopilotHub for personal, non-commercial transitory 
                viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on CopilotHub</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed mb-4">
                To access certain features of the Service, you may be required to create an account using GitHub OAuth. 
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li>Maintaining the security of your account</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content and Contributions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-slate-200">Your Contributions</h3>
                <p className="text-slate-300 leading-relaxed">
                  By contributing content to CopilotHub through GitHub pull requests, you grant us a worldwide, 
                  non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and 
                  distribute your content in any existing or future media.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-200">Content Standards</h3>
                <p className="text-slate-300 leading-relaxed mb-2">Your contributions must:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Be accurate and not misleading</li>
                  <li>Not violate any third-party rights (including copyright, trademark, privacy, or publicity rights)</li>
                  <li>Not contain illegal, harmful, or offensive content</li>
                  <li>Comply with our contribution guidelines</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are owned by CopilotHub and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Content contributed by users remains their property, but by contributing, you grant us the license 
                described above. All content on CopilotHub is provided under open-source licenses as specified in 
                our GitHub repository.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed mb-4">You may not use the Service:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any malicious code, viruses, or harmful materials</li>
                <li>To impersonate or attempt to impersonate another user or entity</li>
                <li>To engage in any automated use of the system (scraping, crawling, etc.) without permission</li>
                <li>To interfere with or disrupt the Service or servers</li>
                <li>To collect or store personal data about other users</li>
                <li>For any spam, phishing, or fraudulent activities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed mb-4">
                The information on CopilotHub is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, 
                we exclude all representations, warranties, and conditions relating to our website and the use of this website.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We do not warrant that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 mt-2">
                <li>The website will be constantly available or available at all</li>
                <li>The information on the website is complete, true, accurate, or non-misleading</li>
                <li>The content provided is suitable for your specific use case</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">
                In no event shall CopilotHub, its directors, employees, partners, agents, suppliers, or affiliates, 
                be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use 
                of the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice 
                or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon 
                termination, your right to use the Service will immediately cease.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which CopilotHub operates, 
                without regard to its conflict of law provisions. Our failure to enforce any right or provision of these 
                Terms will not be considered a waiver of those rights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
                is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What 
                constitutes a material change will be determined at our sole discretion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our{' '}
                <a 
                  href="https://github.com/eddybenchek/copilothub" 
                  className="text-sky-400 hover:text-sky-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub repository
                </a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

