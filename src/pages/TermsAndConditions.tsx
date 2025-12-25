import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Terms and Conditions | ISECO" 
        description="Read the terms and conditions governing the use of ISECO platform and AHSS electoral services."
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
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl">Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </CardHeader>
          
          <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold m-0">1. Acceptance of Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Independent Students Electoral Commission Online (ISECO) platform, 
                you agree to be bound by these Terms and Conditions and all applicable laws and regulations. 
                If you do not agree with any of these terms, you are prohibited from using this platform.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold m-0">2. User Eligibility</h2>
              </div>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You must be a registered student of the College of Health Sciences to participate in elections.</li>
                <li>Voters must be verified members of the Allied Health Sciences Students' Association (AHSS).</li>
                <li>Aspirants must meet all eligibility requirements as specified by the Electoral Committee.</li>
                <li>Users must provide accurate and truthful information during registration.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold m-0">3. Electoral Rules and Conduct</h2>
              </div>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>All users must abide by the AHSS Constitution and Electoral Guidelines.</li>
                <li>Any form of electoral malpractice, including vote buying, intimidation, or multiple voting, is strictly prohibited.</li>
                <li>Campaign activities must be conducted in accordance with the guidelines set by the Electoral Committee.</li>
                <li>Decisions of the Electoral Committee are final and binding on all parties.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold m-0">4. Prohibited Activities</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Users are prohibited from:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Attempting to access another user's account or voting credentials.</li>
                <li>Manipulating or attempting to manipulate election results.</li>
                <li>Sharing login credentials or biometric data with others.</li>
                <li>Using automated systems or bots to interact with the platform.</li>
                <li>Engaging in any activity that disrupts the electoral process.</li>
                <li>Spreading false information about candidates or the electoral process.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Account Responsibilities</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to notify the Electoral Committee immediately of any unauthorized use of your account.</li>
                <li>You are responsible for all activities that occur under your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, logos, and materials on this platform are the property of AHSS and ISECO. 
                Users may not reproduce, distribute, or create derivative works without explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                ISECO and AHSS shall not be liable for any indirect, incidental, special, or consequential 
                damages arising from your use of the platform. We do not guarantee uninterrupted access to 
                the platform and reserve the right to suspend services for maintenance or security purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Amendments</h2>
              <p className="text-muted-foreground leading-relaxed">
                ISECO reserves the right to modify these terms at any time. Users will be notified of 
                significant changes, and continued use of the platform constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance with the AHSS Constitution 
                and the regulations of the College of Health Sciences, University of Ilorin.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions regarding these Terms and Conditions, please contact the Electoral Committee 
                through the official ISECO support channels or visit the Help Desk.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                By using ISECO, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;
