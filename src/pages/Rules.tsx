import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Scale, Users, Shield, Vote, Loader2, Download, Printer, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Logo, DualLogo } from "@/components/NavLink";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";

// Constitution content extracted from the COHSSA Constitution document
const constitutionSections = [
  {
    title: "PREAMBLE",
    content: `We, the students of the College of Health Sciences, Al-Hikmah University Ilorin-Nigeria, recognizing the importance of education and the promotion of health science in a university setting, hereby establish this Constitution. This Constitution shall govern the activities, rights, and responsibilities of members of the College of Health Sciences Students Association (COHSSA) in accordance with the rules and regulations of Al-Hikmah University.

RECOGNISING: The uniqueness of the discipline embracing education as regards imparting of knowledge.

DESIROUS: Of creating a forum where students of the College of Health Sciences meet for the purpose of upholding the aims and objectives of Health practice in AL-HIKMAH University, Ilorin (HUI).

AWARENESS: Of the role which such a forum will play in the educational and social advancement of the students in the College of Health Sciences.

RESOLUTION: We, the students of the College of Health Sciences Al-Hikmah University, Kwara State hereby resolve to uphold this constitution, strive towards educational advancement and also to form a virile, dynamic, non-political, educational and social organization.`
  },
  {
    title: "ARTICLE 1: GENERAL PROVISIONS",
    content: `SECTION I: SUPREMACY OF THE CONSTITUTION
This Constitution is the ultimate governing document of the College and shall have binding authority over all members, officers, and organs of COHSSA. In cases of conflict, this Constitution shall defer to Al-Hikmah University's regulations and the Constitution of the Federal Republic of Nigeria.

SECTION II: NAME, MOTTO, LOGO AND ADDRESS
• Name: COLLEGE OF HEALTH SCIENCES STUDENTS ASSOCIATION (Al-Hikmah University Chapter)
• Motto: HEALTH FIRST
• Logo: Circle containing a golden caduceus, a traditional symbol of medicine and health
• Address: College of Health Science, Al-Hikmah University, Ilorin, Kwara State, Nigeria P.M.B. 1601, Ilorin.

SECTION III: AIMS AND OBJECTIVES
1. To promote the welfare, academic, and social interests of all COHSSA members.
2. To foster discipline among the students of the College of Health Sciences.
3. To foster communication and collaboration between students, the College, and the university administration.
4. To uplift the College of Health Sciences.
5. To cooperate and exchange ideas with the members and lecturers.
6. To bridge the gaps of discrimination among the students.
7. To encourage leadership development and involvement in student activities.
8. To advocate for the interests of Health Sciences students at Al-Hikmah University.
9. To establish ethical standards and encourage leadership, responsibility, and academic integrity.
10. To ensure an inclusive and non-discriminatory environment.

SECTION IV: MEMBERSHIP
There shall be four grades of membership:
• Ground members: All bonafide students of the college of Health sciences that is duly matriculated.
• Associate members: Non-Health sciences students may join by paying a prescribed fee but will not hold voting rights or be eligible for election.
• Honorary members: Conferred on distinguished individuals based on contributions to the college.
• Ex-officials: All officers of previous administration.`
  },
  {
    title: "ARTICLE 2: ORGANS OF THE COLLEGE",
    content: `The organs of the College shall consist of:
• The Executive
• The Legislative`
  },
  {
    title: "ARTICLE 3: THE EXECUTIVE COUNCIL",
    content: `SECTION I: ESTABLISHMENT
There shall be an Executive Council (EXCO) for the College.

SECTION II: COMPOSITION
The Executive Council shall comprise of the following elected officers:
• THE PRESIDENT
• VICE PRESIDENT
• GENERAL SECRETARY
• ASSISTANT GENERAL SECRETARY
• FINANCIAL SECRETARY
• TREASURER
• PUBLIC RELATIONS OFFICER I & II
• ACADEMIC DIRECTOR I & II
• SPORT DIRECTOR
• ASSISTANT SPORT DIRECTOR
• SOCIAL DIRECTOR I & II
• WELFARE DIRECTOR I & II
• AUDITOR GENERAL

SECTION III: POWERS AND DUTIES
• Provide for an executive meeting to hold as many as required in a year
• Reach decisions and adopt motions at such meetings by a simple majority
• Attend meetings on behalf of the college
• Organize the Annual General COHSSA HUI Congress
• See to the day to day running of the College

SECTION IV: GENERAL QUALIFICATION
Candidates must:
• Possess a minimum CGPA of 3.0
• At least two COHSSA receipts
• A clearance from the university security unit
• Be free from criminal records or ongoing disciplinary actions
• Demonstrate understanding of the office sought

SECTION V: TENURE OF OFFICE
• The tenure of office for all officers shall be one academic session
• A member can serve a maximum of two terms in a position if re-elected`
  },
  {
    title: "ARTICLE 4: THE LEGISLATIVE (HSSRC)",
    content: `SECTION I: ESTABLISHMENT
There shall be a Health Sciences Students Representative Council (HSSRC).

SECTION II: COMPOSITION
The HSSRC shall comprise of elected senators from each department.

SECTION III: GENERAL QUALIFICATIONS
Similar to Executive Council qualifications.

SECTION IV: TENURE OF OFFICE
One academic session with possibility of re-election.

SECTION V: DUTIES AND POWERS
• Legislative oversight of the Executive Council
• Approval of budgets and major decisions
• Screening of appointed officials`
  },
  {
    title: "ARTICLE 5: THE CONGRESS",
    content: `SECTION I: GENERAL COHSSA HUI CONGRESS
The Congress is the highest decision-making body of the Association.

SECTION II: COMPOSITION
All bonafide members of COHSSA HUI Chapter.

SECTION III: FUNCTIONS
• Deliberate on matters affecting the association
• Approve major policies and constitutional amendments
• Elect principal officers when required`
  },
  {
    title: "ARTICLE 6: THE ELECTORAL ACT",
    content: `SECTION I: THE ELECTORAL COMMITTEE
An Independent Electoral Committee shall be established for conducting elections.

SECTION II: COMPOSITION
• Chairman
• Secretary
• Members from each department

SECTION III: DUTIES
• Conduct free and fair elections
• Screen candidates
• Announce results
• Handle electoral disputes

SECTION V: QUALIFICATION OF CANDIDATES
• Must meet general qualification requirements
• Must be in good academic standing
• Must be free from disciplinary issues

SECTION VI: QUALIFICATION OF VOTERS
• Must be a bonafide member of COHSSA
• Must have paid association dues
• Must be duly registered

SECTION VII: VOTING PROCEDURE
• Voting shall be by secret ballot
• One person, one vote principle
• Electronic voting may be adopted`
  },
  {
    title: "ARTICLE 7: FINANCE, BUDGET AND AUDIT",
    content: `SECTION I: FINANCE
• The association shall maintain proper financial records
• All funds shall be managed transparently

SECTION II: BUDGET
• Annual budget shall be prepared by the Executive Council
• Budget must be approved by the HSSRC

SECTION III: AUDITING
• The Auditor General shall conduct regular audits
• Annual financial statements shall be presented to Congress

SECTION IV: FINANCIAL TRANSPARENCY
• All financial transactions must be documented
• Records shall be available for inspection by members`
  },
  {
    title: "ARTICLE 8: COMMITTEES",
    content: `SECTION I: STANDING COMMITTEES
Permanent committees for ongoing association functions.

SECTION II: AD-HOC COMMITTEES
Temporary committees for specific tasks.

SECTION III: RESPONSIBILITIES
• Execute assigned duties diligently
• Report to appropriate authorities
• Maintain transparency in operations`
  },
  {
    title: "ARTICLE 9: AMENDMENT OF THE CONSTITUTION",
    content: `SECTION I: PROPOSAL FOR AMENDMENT
• Any member may propose an amendment
• Proposal must be in writing

SECTION II: REVIEW AND DELIBERATION
• Review by the Constitution and Policy Review Committee
• Discussion in HSSRC

SECTION III: VOTING ON THE AMENDMENT
• Two-thirds majority required for passage
• Special voting for major amendments

SECTION IV: RATIFICATION
• Final approval by Congress
• Announcement of amendment to all members`
  },
  {
    title: "ARTICLE 10: INTERPRETATION AND COMMENCEMENT",
    content: `SECTION I: INTERPRETATION
The Constitution shall be interpreted in accordance with its plain meaning.

SECTION II: CITATION
This Constitution may be cited as "The COHSSA HUI Constitution (As Amended, October 2025)"

SECTION III: COMMENCEMENT
This Constitution comes into effect upon adoption by the Congress.`
  },
  {
    title: "ARTICLE 11: ROTARY LEADERSHIP SYSTEM",
    content: `FRAMEWORK
A rotary system ensures fair representation across departments.

LEADERSHIP ALLOCATION
Positions shall rotate among departments to ensure equity.

GUIDELINES
• Each department shall have opportunity for leadership
• Rotation follows established order
• Exceptions may be made with Congress approval`
  }
];

const Rules = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRules = async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "election_rules")
        .maybeSingle();

      if (data) {
        const settingValue = data.setting_value as { content?: string };
        setRules(settingValue.content || "Electoral rules will be available soon.");
      }
      setLoading(false);
    };

    fetchRules();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/AHSS_CONSTITUTION_AS_AMENDED_OCTOBER_2025.docx';
    link.download = 'COHSSA_CONSTITUTION_AS_AMENDED_OCTOBER_2025.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const principles = [
    {
      icon: Users,
      title: "Eligibility",
      description: "All registered COHSSA students are eligible to vote. Aspirants must meet specific academic and departmental requirements.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: Shield,
      title: "Voter Anonymity",
      description: "Complete voter anonymity through token-based voting. Your vote cannot be traced back to your identity.",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      icon: Vote,
      title: "One Person, One Vote",
      description: "Each verified voter can cast only one vote per position. Secure token management prevents double voting.",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      icon: Scale,
      title: "Transparent Process",
      description: "All election stages are clearly communicated with real-time result publishing during the counting phase.",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <SEO 
        title="COHSSA Constitution & Rules" 
        description="Read the official COHSSA Constitution and electoral rules for Al-Hikmah University elections. Download the full constitution document."
        keywords="COHSSA constitution, electoral rules, Al-Hikmah University, student elections, voting rules"
      />
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-content, #printable-content * {
            visibility: visible;
          }
          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none no-print">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 animate-fade-in no-print">
          <DualLogo className="h-10 w-auto" />
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </header>

        <div id="printable-content" ref={printRef} className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              COHSSA Constitution
            </h1>
            <p className="text-xl text-muted-foreground">As Amended, October 2025</p>
            <p className="text-sm text-muted-foreground mt-2">Al-Hikmah University Chapter</p>
          </div>

          {/* Key Principles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-in no-print">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <Card 
                  key={principle.title} 
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${principle.bg} group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${principle.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{principle.title}</h3>
                        <p className="text-sm text-muted-foreground">{principle.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Download Banner */}
          <Card className="mb-8 border-primary/20 bg-primary/5 animate-fade-in no-print">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Download Full Constitution</h3>
                  <p className="text-sm text-muted-foreground">Get the complete COHSSA Constitution document</p>
                </div>
              </div>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download DOCX
              </Button>
            </CardContent>
          </Card>

          {/* Constitution Content */}
          <Card className="shadow-xl border-primary/10 overflow-hidden animate-fade-in mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Constitution of COHSSA - Al-Hikmah University Chapter
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <Accordion type="single" collapsible className="space-y-2">
                {constitutionSections.map((section, index) => (
                  <AccordionItem key={index} value={`section-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="text-left font-semibold">{section.title}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed py-4">
                        {section.content}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Election Rules */}
          <Card className="shadow-xl border-primary/10 overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Election Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {rules || "No election rules have been published yet. Please check back later."}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="max-w-4xl mx-auto mt-8 text-center no-print">
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rules;
