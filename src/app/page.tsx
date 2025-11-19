'use client';

import { getContactFormSuggestions, type ContactFormSuggestionsInput } from '@/ai/flows/contact-form-suggestions';
import { submitContactForm } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import React, { useEffect, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

// --- DATA ---
const profile = {
  name: 'Alex Doe',
  introduction: "I'm a passionate Full-Stack Developer with experience in building modern web applications using React, Next.js, and Node.js. I thrive on solving complex problems and creating intuitive, user-friendly experiences.",
  headshot: PlaceHolderImages.find(p => p.id === 'headshot'),
  socials: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    email: 'mailto:alex.doe@example.com',
  },
};

const education = [
  {
    institution: 'University of Technology',
    degree: 'B.S. in Computer Science',
    period: '2018 - 2022',
    description: 'Graduated with honors, focusing on software engineering and artificial intelligence. Active member of the coding club.'
  },
  {
    institution: 'Online Coding Bootcamp',
    degree: 'Full-Stack Web Development',
    period: '2022',
    description: 'Intensive program covering MERN stack, data structures, and algorithms.'
  },
];

const projects = [
  {
    title: 'Project Alpha',
    description: 'A comprehensive project management tool designed to streamline team collaboration and task tracking.',
    image: PlaceHolderImages.find(p => p.id === 'project-1'),
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma']
  },
  {
    title: 'Project Beta',
    description: 'A mobile-first social networking app for hobbyists to connect and share their creations.',
    image: PlaceHolderImages.find(p => p.id === 'project-2'),
    liveUrl: '#',
    githubUrl: '#',
    tags: ['React Native', 'Firebase', 'GraphQL']
  },
  {
    title: 'Project Gamma',
    description: 'An interactive data visualization dashboard for analyzing market trends, built with D3.js.',
    image: PlaceHolderImages.find(p => p.id === 'project-3'),
    liveUrl: '#',
    githubUrl: '#',
    tags: ['React', 'D3.js', 'Redux']
  },
];

const workExperience = [
  {
    company: 'Tech Solutions Inc.',
    role: 'Software Engineer',
    period: '2022 - Present',
    responsibilities: [
      'Developed and maintained features for a large-scale e-commerce platform.',
      'Collaborated with cross-functional teams to define and ship new features.',
      'Improved application performance by 20% through code optimization.',
    ]
  },
  {
    company: 'Web Innovators LLC',
    role: 'Junior Web Developer',
    period: '2021 - 2022',
    responsibilities: [
      'Assisted in building responsive websites for various clients.',
      'Translated UI/UX designs into functional and interactive web pages.',
      'Gained experience with modern frontend frameworks and libraries.',
    ]
  }
];

const navItems = [
  { name: 'Home', id: 'home' },
  { name: 'Education', id: 'education' },
  { name: 'Projects', id: 'projects' },
  { name: 'Work', id: 'work' },
  { name: 'Contact', id: 'contact' },
];

// --- FORM SCHEMA & ACTIONS ---
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// --- MAIN PAGE COMPONENT ---
export default function PortfolioPage() {
  const [activeSection, setActiveSection] = useState('home');
  const sectionRefs = {
    home: useRef<HTMLElement>(null),
    education: useRef<HTMLElement>(null),
    projects: useRef<HTMLElement>(null),
    work: useRef<HTMLElement>(null),
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

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(sectionRefs).forEach((ref) => {
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
        <EducationSection ref={sectionRefs.education} />
        <ProjectsSection ref={sectionRefs.projects} />
        <WorkExperienceSection ref={sectionRefs.work} />
        <ContactSection ref={sectionRefs.contact} />
      </main>
      <Footer />
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
      <div className="container flex h-14 max-w-5xl items-center justify-between">
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

const Section = React.forwardRef<HTMLElement, { id: string; className?: string; children: React.ReactNode }>(
  ({ id, className, children }, ref) => (
    <section id={id} ref={ref} className={cn("container max-w-5xl py-16 md:py-24", className)}>
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

const HeroSection = React.forwardRef<HTMLElement>((props, ref) => (
  <Section id="home" ref={ref} className="!pt-20 md:!pt-28 text-center md:text-left">
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
        <div className="md:col-span-2 space-y-4">
            <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tighter">
                {profile.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
                {profile.introduction}
            </p>
            <div className="flex justify-center md:justify-start gap-4 pt-4">
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
        <div className="flex justify-center">
        {profile.headshot && (
            <Avatar className="h-48 w-48 md:h-64 md:w-64 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={profile.headshot.imageUrl} alt={profile.name} data-ai-hint={profile.headshot.imageHint} />
                <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
        )}
        </div>
    </div>
  </Section>
));
HeroSection.displayName = "HeroSection";

const EducationSection = React.forwardRef<HTMLElement>((props, ref) => (
  <Section id="education" ref={ref} className="bg-muted/50">
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

const ProjectsSection = React.forwardRef<HTMLElement>((props, ref) => (
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
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
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

const WorkExperienceSection = React.forwardRef<HTMLElement>((props, ref) => (
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

const ContactSection = React.forwardRef<HTMLElement>((props, ref) => {
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
    <Section id="contact" ref={ref}>
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
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">alex.doe@example.com</span>
                </a>
                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">linkedin.com/in/alex-doe</span>
                </a>
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">github.com/alex-doe</span>
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
