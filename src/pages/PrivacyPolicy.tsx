import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Database, Eye, Lock, UserCheck, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Privacy Policy | ISECO" 
        description="Learn how ISECO collects, uses, and protects your personal data in accordance with data protection regulations."
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>

        <Card>
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </CardHeader>
          
          <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
            <section>
              <p className="text-muted-foreground leading-relaxed">
                The Independent Students Electoral Commission Online (ISECO) is committed to protecting 
                your privacy and ensuring the security of your personal information. This Privacy Policy 
                explains how we collect, use, store, and protect your data when you use our platform.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold m-0">1. Information We Collect</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We collect the following types of information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Personal Information:</strong> Name, matriculation number, email address, phone number, department, and level of study.</li>
                <li><strong>Academic Information:</strong> CGPA (for aspirants), faculty affiliation, and academic status.</li>
                <li><strong>Authentication Data:</strong> Login credentials, biometric data (for voter verification), and session information.</li>
                <li><strong>Electoral Data:</strong> Voting records (anonymized), aspirant applications, and manifesto content.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and usage patterns.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold m-0">2. How We Use Your Information</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Your information is used for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Verifying your identity and eligibility to participate in elections.</li>
                <li>Processing voter registration and aspirant applications.</li>
                <li>Administering and securing the electoral process.</li>
                <li>Preventing electoral fraud and ensuring vote integrity.</li>
                <li>Communicating important electoral information and updates.</li>
                <li>Generating anonymized statistics for electoral reporting.</li>
                <li>Improving platform functionality and user experience.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold m-0">3. Data Security</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We implement robust security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>End-to-end encryption for sensitive data transmission.</li>
                <li>Secure database storage with access controls.</li>
                <li>Regular security audits and vulnerability assessments.</li>
                <li>Multi-factor authentication for administrative access.</li>
                <li>Anonymization of voting data to protect ballot secrecy.</li>
                <li>Automated session timeouts for inactive users.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold m-0">4. Data Sharing</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We do not sell your personal information. Data may be shared only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Electoral Committee:</strong> Authorized committee members for electoral administration.</li>
                <li><strong>AHSS Leadership:</strong> For official association purposes as permitted by the constitution.</li>
                <li><strong>Legal Requirements:</strong> When required by law or university regulations.</li>
                <li><strong>Service Providers:</strong> Trusted third-party services that help operate the platform (under strict confidentiality agreements).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                Personal data is retained for the duration of your enrollment at the College of Health Sciences. 
                Electoral records are maintained for a period of 2 academic years for audit and dispute resolution purposes. 
                After this period, data is securely deleted or anonymized for statistical purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data we hold.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements).</li>
                <li><strong>Objection:</strong> Object to certain types of data processing.</li>
                <li><strong>Portability:</strong> Request transfer of your data in a portable format.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies to maintain your session and ensure platform security. 
                We do not use third-party advertising or tracking cookies. Session cookies are 
                automatically deleted when you close your browser or after a period of inactivity.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold m-0">8. Updates to This Policy</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically to reflect changes in our practices or 
                legal requirements. Users will be notified of significant changes through platform 
                announcements or email notifications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy or wish to exercise your data rights, 
                please contact the Electoral Committee through the ISECO Help Desk or via the official 
                AHSS communication channels.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                Your privacy is important to us. We are committed to handling your data responsibly and transparently.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
