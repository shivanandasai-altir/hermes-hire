import { describe, it, expect } from "vitest";
import {
  MessageTypeEnum,
  MessageRoleEnum,
  TranscriptMessageTypeEnum,
} from "@/types/vapi";
import type {
  BaseMessage,
  TranscriptMessage,
  FunctionCallMessage,
  FunctionCallResultMessage,
  VapiMessage,
  SavedMessage,
} from "@/types/vapi";

describe("Vapi Enums", () => {
  describe("MessageTypeEnum", () => {
    it("has TRANSCRIPT", () => {
      expect(MessageTypeEnum.TRANSCRIPT).toBe("transcript");
    });
    it("has FUNCTION_CALL", () => {
      expect(MessageTypeEnum.FUNCTION_CALL).toBe("function-call");
    });
    it("has FUNCTION_CALL_RESULT", () => {
      expect(MessageTypeEnum.FUNCTION_CALL_RESULT).toBe("function-call-result");
    });
    it("has ADD_MESSAGE", () => {
      expect(MessageTypeEnum.ADD_MESSAGE).toBe("add-message");
    });
  });

  describe("MessageRoleEnum", () => {
    it("has USER", () => {
      expect(MessageRoleEnum.USER).toBe("user");
    });
    it("has SYSTEM", () => {
      expect(MessageRoleEnum.SYSTEM).toBe("system");
    });
    it("has ASSISTANT", () => {
      expect(MessageRoleEnum.ASSISTANT).toBe("assistant");
    });
  });

  describe("TranscriptMessageTypeEnum", () => {
    it("has PARTIAL", () => {
      expect(TranscriptMessageTypeEnum.PARTIAL).toBe("partial");
    });
    it("has FINAL", () => {
      expect(TranscriptMessageTypeEnum.FINAL).toBe("final");
    });
  });
});

describe("Vapi Types", () => {
  describe("BaseMessage", () => {
    it("requires a type field", () => {
      const msg: BaseMessage = { type: MessageTypeEnum.TRANSCRIPT };
      expect(msg.type).toBe("transcript");
    });
  });

  describe("TranscriptMessage", () => {
    it("has all required fields", () => {
      const msg: TranscriptMessage = {
        type: MessageTypeEnum.TRANSCRIPT,
        role: MessageRoleEnum.USER,
        transcriptType: TranscriptMessageTypeEnum.FINAL,
        transcript: "Hello, I'm a candidate",
      };
      expect(msg.type).toBe("transcript");
      expect(msg.role).toBe("user");
      expect(msg.transcriptType).toBe("final");
      expect(msg.transcript).toBe("Hello, I'm a candidate");
    });

    it("supports partial transcripts", () => {
      const msg: TranscriptMessage = {
        type: MessageTypeEnum.TRANSCRIPT,
        role: MessageRoleEnum.ASSISTANT,
        transcriptType: TranscriptMessageTypeEnum.PARTIAL,
        transcript: "Let me think about...",
      };
      expect(msg.transcriptType).toBe("partial");
    });

    it("supports system role", () => {
      const msg: TranscriptMessage = {
        type: MessageTypeEnum.TRANSCRIPT,
        role: MessageRoleEnum.SYSTEM,
        transcriptType: TranscriptMessageTypeEnum.FINAL,
        transcript: "System initialized",
      };
      expect(msg.role).toBe("system");
    });
  });

  describe("FunctionCallMessage", () => {
    it("has function call with name and parameters", () => {
      const msg: FunctionCallMessage = {
        type: MessageTypeEnum.FUNCTION_CALL,
        functionCall: {
          name: "getWeather",
          parameters: { city: "New York" },
        },
      };
      expect(msg.functionCall.name).toBe("getWeather");
      expect(msg.functionCall.parameters).toEqual({ city: "New York" });
    });

    it("parameters can be any JSON value", () => {
      const msg: FunctionCallMessage = {
        type: MessageTypeEnum.FUNCTION_CALL,
        functionCall: {
          name: "submitFeedback",
          parameters: { rating: 5, comments: "Great" },
        },
      };
      expect(msg.functionCall.name).toBe("submitFeedback");
    });
  });

  describe("FunctionCallResultMessage", () => {
    it("has result with forwardToClientEnabled and result", () => {
      const msg: FunctionCallResultMessage = {
        type: MessageTypeEnum.FUNCTION_CALL_RESULT,
        functionCallResult: {
          forwardToClientEnabled: true,
          result: { status: "ok" },
        },
      };
      expect(msg.functionCallResult.forwardToClientEnabled).toBe(true);
      expect(msg.functionCallResult.result).toEqual({ status: "ok" });
    });

    it("supports additional properties", () => {
      const msg: FunctionCallResultMessage = {
        type: MessageTypeEnum.FUNCTION_CALL_RESULT,
        functionCallResult: {
          forwardToClientEnabled: false,
          result: "done",
          extraField: "value",
        },
      };
      expect(msg.functionCallResult.extraField).toBe("value");
    });
  });

  describe("VapiMessage union", () => {
    it("accepts TranscriptMessage", () => {
      const msg: VapiMessage = {
        type: MessageTypeEnum.TRANSCRIPT,
        role: MessageRoleEnum.USER,
        transcriptType: TranscriptMessageTypeEnum.FINAL,
        transcript: "test",
      };
      expect(msg.type).toBe("transcript");
    });

    it("accepts FunctionCallMessage", () => {
      const msg: VapiMessage = {
        type: MessageTypeEnum.FUNCTION_CALL,
        functionCall: { name: "fn", parameters: {} },
      };
      expect(msg.type).toBe("function-call");
    });

    it("accepts FunctionCallResultMessage", () => {
      const msg: VapiMessage = {
        type: MessageTypeEnum.FUNCTION_CALL_RESULT,
        functionCallResult: { result: "ok" },
      };
      expect(msg.type).toBe("function-call-result");
    });
  });

  describe("SavedMessage", () => {
    it("requires role and content", () => {
      const msg: SavedMessage = {
        role: "user",
        content: "Hello",
      };
      expect(msg.role).toBe("user");
      expect(msg.content).toBe("Hello");
    });

    it("supports all three roles", () => {
      const messages: SavedMessage[] = [
        { role: "user", content: "Hi" },
        { role: "system", content: "System msg" },
        { role: "assistant", content: "Hello!" },
      ];
      expect(messages).toHaveLength(3);
    });

    it("content can be empty string", () => {
      const msg: SavedMessage = { role: "assistant", content: "" };
      expect(msg.content).toBe("");
    });
  });
});
