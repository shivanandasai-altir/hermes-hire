"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Phone, PhoneOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/lib/voice/assistant-config";
import { generateFeedbackFromTranscript } from "@/lib/voice/feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SavedMessage, VapiMessage } from "@/types/vapi";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
  candidateName?: string;
  onComplete?: (transcript: SavedMessage[], feedback: unknown) => void;
}

export function Agent({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  candidateName,
  onComplete,
}: AgentProps) {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMessage = useCallback((message: VapiMessage) => {
    if (message.type === "transcript" && message.transcriptType === "final") {
      const newMessage = {
        role: message.role,
        content: message.transcript,
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  }, []);

  const handleSpeechStart = useCallback(() => {
    setIsSpeaking(true);
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setIsSpeaking(false);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error("Vapi error:", error);
  }, []);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("error", handleError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", handleMessage);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("error", handleError);
    };
  }, [handleMessage, handleSpeechStart, handleSpeechEnd, handleError]);

  // Derive last message from messages array (no effect needed)
  const lastMessage = messages.length > 0
    ? messages[messages.length - 1].content
    : "";

  // Handle call completion
  useEffect(() => {
    const handleCallComplete = async () => {
      if (callStatus !== CallStatus.FINISHED) return;

      if (type === "generate") {
        router.push("/");
        return;
      }

      if (type === "interview" && messages.length > 0) {
        setIsProcessing(true);
        try {
          const feedback = await generateFeedbackFromTranscript(messages);
          onComplete?.(messages, feedback);
        } catch (err) {
          console.error("Failed to generate feedback:", err);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handleCallComplete();
  }, [callStatus, messages, type, router, onComplete]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* AI Interviewer + Candidate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* AI Interviewer Card */}
        <Card className="flex flex-col items-center gap-3 p-6 bg-muted/50 border-2 border-primary/10">
          <div className="relative">
            <Avatar className="size-24 ring-2 ring-primary/20">
              <AvatarImage src="/ai-avatar.png" alt="AI Interviewer" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                AI
              </AvatarFallback>
            </Avatar>
            {isSpeaking && (
              <span className="absolute inset-0 size-24 rounded-full animate-ping bg-primary/20" />
            )}
          </div>
          <h3 className="font-semibold text-lg">AI Interviewer</h3>
          <p className="text-sm text-muted-foreground">
            {isSpeaking ? "Speaking..." : "Listening"}
          </p>
        </Card>

        {/* Candidate Card */}
        <Card className="flex flex-col items-center gap-3 p-6 border-2 border-border">
          <div className="relative">
            <Avatar className="size-24">
              <AvatarImage src="/user-avatar.png" alt={userName} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {callStatus === CallStatus.ACTIVE && !isSpeaking && (
              <span className="absolute inset-0 size-24 rounded-full animate-ping bg-muted-foreground/20" />
            )}
          </div>
          <h3 className="font-semibold text-lg">{userName}</h3>
          <p className="text-sm text-muted-foreground">
            {candidateName || "Candidate"}
          </p>
        </Card>
      </div>

      {/* Transcript */}
      {messages.length > 0 && (
        <Card className="w-full max-w-2xl p-4 bg-muted/30">
          <p
            key={lastMessage}
            className={cn(
              "text-sm text-center transition-opacity duration-500 italic text-muted-foreground",
            )}
          >
            {lastMessage}
          </p>
        </Card>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span>Generating feedback from interview...</span>
        </div>
      )}

      {/* Call Controls */}
      <div className="flex gap-4">
        {callStatus === CallStatus.INACTIVE ||
        callStatus === CallStatus.FINISHED ? (
          <Button
            size="lg"
            onClick={handleCall}
            className="gap-2"
            disabled={isProcessing}
          >
            <Phone className="size-4" />
            {callStatus === CallStatus.FINISHED ? "Call Again" : "Start Call"}
          </Button>
        ) : callStatus === CallStatus.CONNECTING ? (
          <Button size="lg" disabled className="gap-2">
            <Loader2 className="size-4 animate-spin" />
            Connecting...
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            onClick={handleDisconnect}
            className="gap-2"
          >
            <PhoneOff className="size-4" />
            End Call
          </Button>
        )}
      </div>

      {callStatus === CallStatus.ACTIVE && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Interview in progress...
        </p>
      )}
    </div>
  );
}
