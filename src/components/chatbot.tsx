'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askPortfolioChatbot, type PortfolioChatInput } from '@/ai/flows/portfolio-chat';
import { Bot, Loader2, Send, X, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function Chatbot({ portfolioData }: { portfolioData: PortfolioChatInput['portfolioData'] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Stop pulsing after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await askPortfolioChatbot({
        question: input,
        portfolioData: portfolioData,
        chatHistory: chatHistory,
      });

      const assistantMessage: Message = { role: 'assistant', content: response.answer };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Pulsing ring animation */}
          {!isOpen && showPulse && (
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          )}
          <Button
            size="icon"
            className="relative rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-110 shadow-primary/50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle chatbot"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Bot className="w-7 h-7" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <Card className="w-80 md:w-96 h-[32rem] flex flex-col shadow-2xl bg-white">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Bot /> AI Assistant
                </CardTitle>
                <CardDescription>Ask me anything about Girith's portfolio!</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6 py-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'assistant' && (
                          <Avatar className="w-8 h-8 border-2 border-primary/20">
                            <AvatarFallback><Bot size={18} /></AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                          }`}
                        >
                          {message.content}
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="w-8 h-8 border-2 border-muted">
                            <AvatarFallback><User size={18} /></AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8 border-2 border-primary/20">
                          <AvatarFallback><Bot size={18} /></AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4 border-t flex-shrink-0">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Type your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading} size="icon">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
