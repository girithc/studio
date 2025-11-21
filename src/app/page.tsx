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
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, ExternalLink, Github, GraduationCap, Linkedin, Loader2, Mail, Menu, Navigation, Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Chatbot } from '@/components/chatbot';


// --- DATA ---
const profile = {
  name: 'Girith Choudhary',
  introduction: "I'm a passionate Software Engineer with a specialization in data science, experienced in building intelligent applications and scalable systems. I thrive on solving complex problems and creating impactful, data-driven solutions.",
  socials: {
    linkedin: 'https://linkedin.com/in/girithchoudhary',
    github: 'https://github.com/girithc',
    email: 'mailto:girith.choudhary@sjsu.edu',
  },
};

const projects = [
  {
    title: 'Email Automation Using AI Agents',
    description: 'Built a self-healing AI agent pipeline automating email, scheduling, and workspace tasks with adaptive recovery. Integrated NVIDIA NIM for GPU-accelerated LLM, embedding, and speech microservices with NeMo Guardrails for safe automation. Achieved 80% faster workflows via real-time updates, intent-driven coordination, and Riva ASR transcription.',
    image: {
      id: 'project-1',
      imageUrl: '/assets/email.png',
      imageHint: 'email automation'
    },
    liveUrl: '#',
    githubUrl: '#',
    tags: ['LangChain', 'LangGraph', 'FastAPI', 'Google Workspace API', 'GCP Pub/Sub', 'Firebase', 'NVIDIA NIM', 'Riva ASR', 'NeMo Guardrails', 'GPT']
  },
  {
    title: 'Universal Translator App',
    description: 'Created cross-language translator with real-time speech processing and LoRA-tuned models. Used WebSocket streaming via FastAPI for low-latency inference and adaptive language learning. Containerized and deployed app on Apple App Store.',
    image: {
      id: 'project-2',
      imageUrl: '/assets/translate.png',
      imageHint: 'translation app'
    },
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Flutter', 'FastAPI', 'Whisper', 'PyTorch', 'LoRA', 'Docker']
  },
  {
    title: 'McKinsey Consultant Agent',
    description: 'Built an autonomous McKinsey-style consultant agent for strategic reasoning and hypothesis-driven research. Integrated NVIDIA NIM for GPU-accelerated LLM inference and retrieval, enabling faster multi-agent reasoning. Implemented recursive LangGraph agents for adaptive planning with React Flow visualizing dynamic hypothesis trees.',
    image: {
      id: 'project-3',
      imageUrl: '/assets/mckinsey.png',
      imageHint: 'consultant agent'
    },
    liveUrl: '#',
    githubUrl: '#',
    tags: ['FastAPI', 'LangGraph', 'LangChain', 'React', 'AsyncIO', 'Microsoft Azure', 'NVIDIA NIM']
  },
  {
    title: 'Formula 1 Race Strategy System',
    description: 'Built a hybrid XGBoost–LSTM pipeline for race and in-lap prediction using pit, tire, and circuit telemetry (2.7 MAE). Integrated Qwen via NVIDIA NIM to generate explainable insights and enable interactive user queries on model outputs. Deployed FastAPI inference with Pydantic validation and multi-endpoint strategy API (/predict, /compare, /whatif).',
    image: {
      id: 'project-4',
      imageUrl: '/assets/f1-racing.png',
      imageHint: 'formula 1 racing strategy'
    },
    liveUrl: '#',
    githubUrl: '#',
    tags: ['FastAPI', 'Python', 'XGBoost', 'LSTM', 'NumPy/Pandas', 'Pydantic', 'Joblib', 'Next.js', 'NVIDIA NIM (Qwen)']
  }
];


const workExperience = [
  {
    company: 'AMAG Ships',
    role: 'Software Engineer',
    period: 'Jun \'24 - Nov \'25',
    responsibilities: [
      'Built agent-based ship management platform using quantized LLMs, LangGraph, and FastAPI microservices.',
      'Deployed predictive models for diagnostics and cost estimation with RAG retrieval and WebSocket streaming.'
    ]
  },
  {
    company: 'Otto Mart',
    role: 'Founder',
    period: 'Jun \'23 - May \'24',
    responsibilities: [
      'Built an end-to-end hypergrocery delivery platform integrating payment, delivery, store, and customer apps.',
      'Architected Golang + GCP Cloud Run microservices + Flutter apps serving 1000+ daily users.',
      'Automated CI/CD with GitHub Actions and canary deploys, cutting release latency 80%.',
    ]
  },
  {
    company: 'AMAG Ships',
    role: 'Software Engineer Intern',
    period: 'May \'22 - Aug \'22',
    responsibilities: [
      'Developed FastAPI + Redis services for real-time collaboration and notifications at sub-second latency for 10k+ users.',
      'Implemented containerized CI testing and worker orchestration to improve fault tolerance and deployment reliability.',
    ]
  },
  {
    company: 'ACA Foreside',
    role: 'Software Engineer Intern',
    period: 'May \'21 - Jul \'21',
    responsibilities: [
      'Integrated Salesforce–Great Plains via REST/ETL microservice reducing sync errors 90% and achieving 99.9% uptime.',
      'Added unit/integration testing with nightly builds, improving pipeline reliability and release automation.',
    ]
  },
  {
    company: 'University of Alabama',
    role: 'Undergraduate Research Assistant',
    period: 'Jan \'21 - May \'21',
    responsibilities: [
      'Built Python pipelines for dataset preprocessing, interval arithmetic, and uncertainty quantification.',
    ]
  }
];

const education = [
  {
    institution: 'San Jose State University',
    degree: 'M.S. Software Engineering (data science specialization)',
    description: 'Relevant Coursework: Deep Learning, Machine Learning, Data Engineering, Data Mining, Software Systems, Enterprise Software Platforms, Data Structures & Algorithms, Operating Systems, Data Science, Software Security'
  },
  {
    institution: 'University of Alabama',
    degree: 'B.S. Computer Science and Mathematics (double major)',
    description: 'Awarded Presidential, First Generation and Engineering Scholarship. Mathematics Coursework: Statistics, Calculus I–III, Linear Algebra, Differential Equations, Probability, Engineering Statistics, Discrete Mathematics, Numerical Analysis, Linear Optimization Theory, Stochastic Processes'
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30">
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
    <section id={id} ref={ref} className={cn("container max-w-5xl py-8 md:py-12 px-8", className)}>
      {children}
    </section>
  )
);
Section.displayName = "Section";


const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-headline text-3xl font-bold tracking-tight text-primary md:text-4xl mb-6 text-center">
    {children}
  </h2>
);

const HeroSection = forwardRef<HTMLElement, {}>((props, ref) => (
  <Section id="home" ref={ref} className="!pt-16 md:!pt-20 text-center">
    <div className="space-y-3">
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
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project, index) => (
        <Card key={index} className="flex flex-col overflow-hidden group bg-background/40 backdrop-blur-md border-white/10 hover:bg-background/60 transition-all shadow-lg hover:shadow-2xl hover:shadow-primary/20">
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
  <Section id="work" ref={ref} className="bg-muted/20 backdrop-blur-sm">
    <SectionTitle>Work Experience</SectionTitle>
    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-primary/20">
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
    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-primary/20">
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
  return (
    <Section id="contact" ref={ref} className="bg-muted/20 backdrop-blur-sm">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6 text-center">
          <h3 className="text-2xl font-bold font-headline">Contact Information</h3>
          <p className="text-muted-foreground">
            Feel free to reach out via email or connect with me on social media. I'm always open to discussing new projects, creative ideas, or opportunities.
          </p>
          <div className="space-y-4 pt-4">
            <a href={profile.socials.email} className="flex items-center justify-center gap-4 group">
              <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-muted-foreground group-hover:text-primary transition-colors">girith.choudhary@sjsu.edu</span>
            </a>
            <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 group">
              <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-muted-foreground group-hover:text-primary transition-colors">linkedin.com/in/girithchoudhary</span>
            </a>
            <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 group">
              <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-muted-foreground group-hover:text-primary transition-colors">github.com/girithc</span>
            </a>
          </div>
        </div>
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
