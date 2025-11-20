'use client';

import { getContactFormSuggestions, type ContactFormSuggestionsInput } from '@/ai/flows/contact-form-suggestions';
import { submitContactForm } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, ExternalLink, Github, GraduationCap, Linkedin, Loader2, Mail, Menu, Navigation, Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState, forwardRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Chatbot } from '@/components/chatbot';


// --- DATA ---
const profile = {
  name: 'Girth Choudhary',
  introduction: "I'm a passionate Software Engineer with a specialization in data science, experienced in building intelligent applications and scalable systems. I thrive on solving complex problems and creating impactful, data-driven solutions.",
  headshot: PlaceHolderImages.find(p => p.id === 'headshot'),
  socials: {
    linkedin: 'https://linkedin.com/in/girithchoudhary',
    github: 'https://github.com/girithc',
    email: 'mailto:girith.choudhary@example.com',
  },
};

const projects = [
  {
    title: 'AI Lifestyle Assistant',
    description: 'An intelligent lifestyle assistant using AI agents to perform user tasks and manage personalized routines. Integrated with Google Workspace, it handles scheduling, document editing, and provides real-time assistance for studying and travel.',
    image: PlaceHolderImages.find(p => p.id === 'project-1'),
    liveUrl: '#',
    githubUrl: '#',
    tags: ['LangChain', 'FastAPI', 'LangGraph', 'Flutter', 'Google Cloud Run', 'DeepSeek OCR', 'GPT']
  },
  {
    title: 'Universal Translator App',
    description: 'A cross-platform AI translator using LLMs and OpenAI Whisper with PyTorch for real-time, contextual translation. Features fine-tuned models with LoRA for improved accuracy and WebSocket streaming for low latency.',
    image: PlaceHolderImages.find(p => p.id === 'project-2'),
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Flutter', 'FastAPI', 'LangFlow', 'Qdrant', 'PyTorch', 'LoRA', 'Docker']
  },
  {
    title: 'Formula 1 Race Prediction & Strategy',
    description: 'A data-driven race outcome and driver-performance predictor using Kaggle F1 telemetry. Employs ensemble models (Random Forest, XGBoost) and time-series predictors to optimize pit-stop timing and podium predictions.',
    image: PlaceHolderImages.find(p => p.id === 'project-3'),
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Flutter', 'FastAPI', 'LangChain', 'PostgreSQL', 'PyTorch', 'Scikit-learn', 'XGBoost']
  },
];


const workExperience = [
  {
    company: 'AMAG Ships',
    role: 'Software Engineer',
    period: 'Jun \'24 - Present',
    responsibilities: [
      'Built an AI-driven ship management platform with agent-powered mobile apps, automating onboard workflows and boosting crew productivity by 50%.',
      'Implemented real-time diagnostics for repair analysis and automated cost estimation.',
      'Deployed AI modules for bookkeeping and route optimization, enhancing efficiency and record accuracy.',
    ]
  },
  {
    company: 'Otto Mart',
    role: 'Founder',
    period: 'Jun \'23 - May \'24',
    responsibilities: [
      'Developed Golang microservices on GCP (Cloud Run/SQL) serving 1000+ daily users.',
      'Automated CI/CD with GitHub Actions and canary deploys; reduced release time by 80%.',
      'Built core e-commerce features including catalog, search, checkout, order tracking, and payments.',
    ]
  },
  {
    company: 'AMAG Ships',
    role: 'Software Engineer Intern',
    period: 'May \'22 - Aug \'22',
    responsibilities: [
      'Built a scalable discussion forum using FastAPI, Redis queues, and background workers; added unit tests for CI reliability.',
      'Developed a real-time notification system for task and deadline alerts, reaching 10,000+ users with sub-second latency.',
    ]
  },
  {
    company: 'ACA Foreside',
    role: 'Software Engineer Intern',
    period: 'May \'21 - Jul \'21',
    responsibilities: [
      'Integrated Salesforce with Great Plains (REST + ETL) syncing 10k+ records/day.',
      'Built Python validation microservice, cutting errors by 90% and achieving 99.9% uptime.',
      'Added unit and integration tests with nightly CI jobs, improving reliability and deployment stability.',
    ]
  },
  {
    company: 'University of Alabama',
    role: 'Undergraduate Research Assistant',
    period: 'Jan \'21 - May \'21',
    responsibilities: [
      'Wrote Python tooling to preprocess datasets and generate experiment plots; accelerated lab workflow by 30%.',
      'Studied and implemented interval arithmetic and uncertainty propagation operations in Python.',
    ]
  }
];

const education = [
  {
    institution: 'San Jose State University',
    degree: 'M.S. Software Engineering (Data Science)',
    period: 'Expected Dec \'26',
    description: 'Specializing in data science, focusing on advanced machine learning, data engineering, and large-scale software systems.'
  },
  {
    institution: 'University of Alabama',
    degree: 'B.S. Computer Science & Mathematics',
    period: 'Graduated May \'23',
    description: 'Double major with coursework in Deep Learning, Data Mining, and Distributed Systems.'
  },
];

const navItems = [
  { name: 'Home', id: 'home' },
  { name: 'Projects', id: 'projects' },
  { name: 'Work', id: 'work' },
  { name: 'Education', id: 'education' },
  { name: 'Contact', id: 'contact' },
];

// --- FORM SCHEMA & ACTIONS ---
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

const portfolioData = {
  profile,
  projects,
  workExperience,
  education,
};

// --- MAIN PAGE COMPONENT ---
export default function PortfolioPage() {
  const [activeSection, setActiveSection] = useState('home');
  const sectionRefs = {
    home: useRef<HTMLElement>(null),
    projects: useRef<HTMLElement>(null),
    work: useRef<HTMLElement>(null),
    education: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' }
    );

    const refs = { ...sectionRefs };
    Object.values(refs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(refs).forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [sectionRefs]);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header activeSection={activeSection} />
      <main className="flex-1">
        <HeroSection ref={sectionRefs.home} />
        <ProjectsSection ref={sectionRefs.projects} />
        <WorkExperienceSection ref={sectionRefs.work} />
        <EducationSection ref={sectionRefs.education} />
        <ContactSection ref={sectionRefs.contact} />
      </main>
      <Footer />
      <Chatbot portfolioData={portfolioData} />
    </div>
  );
}

// --- SUB-COMPONENTS ---

const Header = ({ activeSection }: { activeSection: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center gap-4", className)}>
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={() => setIsOpen(false)}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            activeSection === item.id ? "text-primary" : "text-muted-foreground"
          )}
        >
          {item.name}
        </a>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-5xl items-center justify-between px-8">
        <a href="#home" className="flex items-center gap-2 font-bold text-lg">
          <Navigation className="h-5 w-5 text-primary" />
          <span className="font-headline">{profile.name}</span>
        </a>

        <div className="hidden md:flex">
          <NavLinks />
        </div>

        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-8">
                <NavLinks className="flex-col space-y-4 text-lg" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

const Section = forwardRef<HTMLElement, { id: string; className?: string; children: React.ReactNode }>(
  ({ id, className, children }, ref) => (
    <section id={id} ref={ref} className={cn("container max-w-5xl py-20 md:py-28 px-8", className)}>
      {children}
    </section>
  )
);
Section.displayName = "Section";


const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-headline text-3xl font-bold tracking-tight text-primary md:text-4xl mb-12 text-center">
    {children}
  </h2>
);

const HeroSection = forwardRef<HTMLElement, {}>((props, ref) => (
  <Section id="home" ref={ref} className="!pt-24 md:!pt-32 text-center">
    <div className="space-y-6">
        <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tighter">
            {profile.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {profile.introduction}
        </p>
        <div className="flex justify-center gap-4 pt-4 flex-wrap">
            <Button asChild>
                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin /> LinkedIn
                </a>
            </Button>
            <Button variant="secondary" asChild>
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer">
                    <Github /> GitHub
                </a>
            </Button>
            <Button variant="outline" asChild>
                <a href={profile.socials.email}>
                    <Mail /> Email
                </a>
            </Button>
        </div>
    </div>
  </Section>
));
HeroSection.displayName = "HeroSection";

const ProjectsSection = forwardRef<HTMLElement, {}>((props, ref) => (
  <Section id="projects" ref={ref}>
    <SectionTitle>Projects</SectionTitle>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <Card key={index} className="flex flex-col overflow-hidden group">
          {project.image && (
            <div className="aspect-video overflow-hidden">
                <Image
                  src={project.image.imageUrl}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={project.image.imageHint}
                />
            </div>
          )}
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
             <CardDescription>{project.description}</CardDescription>
            <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{tag}</span>
                ))}
            </div>
          </CardContent>
          <CardFooter className="gap-4">
            <Button variant="secondary" asChild className="flex-1">
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github /> Code
              </a>
            </Button>
            <Button asChild className="flex-1">
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Live Demo
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </Section>
));
ProjectsSection.displayName = "ProjectsSection";

const WorkExperienceSection = forwardRef<HTMLElement, {}>((props, ref) => (
    <Section id="work" ref={ref} className="bg-muted/50">
        <SectionTitle>Work Experience</SectionTitle>
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-primary/20">
          {workExperience.map((job, index) => (
            <div key={index} className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <Card className="ml-8 flex-1">
                <CardHeader>
                  <CardTitle>{job.role}</CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span>{job.company}</span>
                    <span className="font-medium">{job.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    {job.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
    </Section>
));
WorkExperienceSection.displayName = "WorkExperienceSection";

const EducationSection = forwardRef<HTMLElement, {}>((props, ref) => (
  <Section id="education" ref={ref}>
    <SectionTitle>Education</SectionTitle>
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-primary/20">
      {education.map((item, index) => (
        <div key={index} className="relative flex items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <Card className="ml-8 flex-1">
            <CardHeader>
              <CardTitle>{item.degree}</CardTitle>
              <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span>{item.institution}</span>
                <span className="font-medium">{item.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  </Section>
));
EducationSection.displayName = "EducationSection";

const ContactSection = forwardRef<HTMLElement, {}>((props, ref) => {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiSuggestions = async () => {
    setIsAiLoading(true);
    setAiSuggestions([]);
    try {
        const input: ContactFormSuggestionsInput = {
            name: profile.name,
            education: education.map(e => `${e.degree} at ${e.institution}`),
            projects: projects.map(p => p.title),
            workExperience: workExperience.map(w => `${w.role} at ${w.company}`)
        };
        const result = await getContactFormSuggestions(input);
        setAiSuggestions(result.suggestions);
    } catch (error) {
        console.error("AI suggestion error:", error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not fetch AI suggestions."
        });
    } finally {
        setIsAiLoading(false);
    }
  };


  return (
    <Section id="contact" ref={ref} className="bg-muted/50">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
            <h3 className="text-2xl font-bold font-headline">Contact Information</h3>
            <p className="text-muted-foreground">
              Feel free to reach out via email or connect with me on social media. I'm always open to discussing new projects, creative ideas, or opportunities.
            </p>
            <div className="space-y-4">
                <a href={profile.socials.email} className="flex items-center gap-4 group">
                    <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">girith.choudhary@example.com</span>
                </a>
                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">linkedin.com/in/girithchoudhary</span>
                </a>
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">github.com/girithc</span>
                </a>
            </div>
             <div className="pt-4">
                <Button onClick={handleAiSuggestions} disabled={isAiLoading} variant="outline" className="text-accent border-accent hover:bg-accent/10 hover:text-accent">
                    {isAiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    AI Message Suggestions
                </Button>
                {aiSuggestions.length > 0 && (
                    <Card className="mt-4 bg-accent/10 border-accent/20">
                        <CardHeader>
                            <CardTitle className="text-lg text-accent">AI Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm text-accent/90">
                                {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>I'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="your.email@example.com" {...field} />
                                 </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Tell me how I can help." {...field} rows={5} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                            Send Message
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </Section>
  );
});
ContactSection.displayName = "ContactSection";

const Footer = () => (
    <footer className="border-t">
        <div className="container max-w-5xl py-6 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {profile.name}. All Rights Reserved.</p>
        </div>
    </footer>
);
