/**
 * Smart Context Detector for Inline Completions
 */

import { monacoTypes } from '@remix-ui/editor';

interface TypingSpeedEntry {
  timestamp: number;
  speed: number;
}

interface SmartContextDetectorOptions {
  rapidTypingThreshold?: number;
  pauseAfterTypingDelay?: number;
  typingSpeedWindowSize?: number;
}

interface SmartContextDetectorStats {
  typingSpeed: number;
  isRapidTyping: boolean;
  lastTypingTime: number;
}

export class SmartContextDetector {
  private typingSpeed: number = 0;
  private lastTypingTime: number = 0;
  private typingSpeedWindow: TypingSpeedEntry[] = [];

  private readonly rapidTypingThreshold: number = 100; // ms between keystrokes
  private readonly pauseAfterTypingDelay: number = 500; // ms to wait after rapid typing
  private readonly typingSpeedWindowSize: number = 10000; // 10 seconds

  constructor(options?: SmartContextDetectorOptions) {
    if (options) {
      this.rapidTypingThreshold = options.rapidTypingThreshold ?? this.rapidTypingThreshold;
      this.pauseAfterTypingDelay = options.pauseAfterTypingDelay ?? this.pauseAfterTypingDelay;
      this.typingSpeedWindowSize = options.typingSpeedWindowSize ?? this.typingSpeedWindowSize;
    }
  }

  shouldShowCompletion(
    model: monacoTypes.editor.ITextModel,
    position: monacoTypes.Position,
    currentTime: number = Date.now()
  ): boolean {
    this.updateTypingSpeed(currentTime);

    const rapidTyping = this.isRapidTyping(currentTime);
    const inStringOrComment = this.isInStringOrComment(model, position);
    const appropriatePosition = this.isAppropriatePosition(model, position);

    // console.log('[SmartContextDetector] shouldShowCompletion check:', {
    //   rapidTyping,
    //   inStringOrComment,
    //   appropriatePosition,
    //   typingSpeed: this.typingSpeed,
    //   timeSinceLastTyping: currentTime - this.lastTypingTime
    // });

    if (rapidTyping) {
      // console.log('[SmartContextDetector] Blocked: rapid typing detected');
      return false;
    }
    if (inStringOrComment) {
      // console.log('[SmartContextDetector] Blocked: in string or comment');
      return false;
    }
    if (!appropriatePosition) {
      // console.log('[SmartContextDetector] Blocked: inappropriate position');
      return false;
    }

    // console.log('[SmartContextDetector] Completion allowed');
    return true;
  }

  updateTypingSpeed(currentTime: number): void {
    if (this.lastTypingTime > 0) {
      const timeDiff = currentTime - this.lastTypingTime;
      this.typingSpeedWindow.push({
        timestamp: currentTime,
        speed: timeDiff
      });

      this.typingSpeedWindow = this.typingSpeedWindow.filter(
        entry => currentTime - entry.timestamp < this.typingSpeedWindowSize
      );

      // Calculate average typing speed
      if (this.typingSpeedWindow.length > 0) {
        const avgSpeed = this.typingSpeedWindow.reduce((sum, entry) => sum + entry.speed, 0) / this.typingSpeedWindow.length;
        this.typingSpeed = avgSpeed;
      }

      // console.log('[SmartContextDetector] Typing speed updated:', {
      //   timeDiff,
      //   avgSpeed: this.typingSpeed,
      //   windowSize: this.typingSpeedWindow.length
      // });
    }
    this.lastTypingTime = currentTime;
  }

  private isRapidTyping(currentTime: number): boolean {
    // If user is typing very quickly, wait a bit before showing completions
    if (this.typingSpeed > 0 && this.typingSpeed < this.rapidTypingThreshold) {
      const timeSinceLastTyping = currentTime - this.lastTypingTime;
      return timeSinceLastTyping < this.pauseAfterTypingDelay;
    }
    return false;
  }

  private isInStringOrComment(model: monacoTypes.editor.ITextModel, position: monacoTypes.Position): boolean {
    const lineContent = model.getLineContent(position.lineNumber);
    const beforeCursor = lineContent.substring(0, position.column - 1);

    let inString = false;
    let stringChar = '';
    let escapeNext = false;

    for (let i = 0; i < beforeCursor.length; i++) {
      const char = beforeCursor[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }

    // Check for comments
    const trimmedLine = lineContent.trim();
    const isComment = trimmedLine.startsWith('//') ||
                     trimmedLine.startsWith('/*') ||
                     trimmedLine.startsWith('*');

    return inString || isComment;
  }

  private isAppropriatePosition(model: monacoTypes.editor.ITextModel, position: monacoTypes.Position): boolean {
    const lineContent = model.getLineContent(position.lineNumber);
    const beforeCursor = lineContent.substring(0, position.column - 1);
    const endChars = [' ', '\n', ';', '.', '(', ')', '{', '}', '[', ']', ':', ',', '<', '>', '=', '+', '-', '*', '/', '%', '&', '|', '^', '!', '?', '~', '@', '#', '$', '`', '"', "'", '\t', '\r', '\v', '\f'];

    if (!endChars.some(char => beforeCursor.endsWith(char))) {
      return false;
    }

    // Additional context checks, Don't complete on comment lines
    const lastLine = beforeCursor.split('\n').at(-1)?.trimStart() || '';
    if (lastLine.startsWith('//') ||
        lastLine.startsWith('/*') ||
        lastLine.startsWith('*') ||
        lastLine.startsWith('*/') ||
        lastLine.endsWith(';')) {
      return false;
    }

    return true;
  }

  getStats(): SmartContextDetectorStats {
    return {
      typingSpeed: this.typingSpeed,
      isRapidTyping: this.isRapidTyping(Date.now()),
      lastTypingTime: this.lastTypingTime
    };
  }

  reset(): void {
    // console.log('[SmartContextDetector] Resetting state');
    this.typingSpeed = 0;
    this.lastTypingTime = 0;
    this.typingSpeedWindow = [];
  }
}