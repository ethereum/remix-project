export function sanitizeCompletionText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text;

  // Extract content from markdown code blocks (```language ... ```)
  const codeBlockRegex = /```[\w]*\n?([\s\S]*?)```/g;
  const codeBlocks: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    codeBlocks.push(match[1].trim());
  }

  // If code blocks are found, return only the code content
  if (codeBlocks.length > 0) {
    return codeBlocks.join('\n\n');
  }

  // If no code blocks found, proceed with general sanitization
  // Remove any remaining markdown code block markers
  sanitized = sanitized.replace(/```[\w]*\n?/g, '');

  // Remove inline code markers (`code`)
  sanitized = sanitized.replace(/`([^`]+)`/g, '$1');

  // Remove markdown headers (# ## ### etc.)
  sanitized = sanitized.replace(/^#{1,6}\s+/gm, '');

  // Remove markdown bold/italic (**text** or *text* or __text__ or _text_)
  // but preserve math expressions like 10**decimalsValue
  sanitized = sanitized.replace(/(\*\*|__)([^*_]*?)\1/g, '$2');
  sanitized = sanitized.replace(/(?<!\w)(\*|_)([^*_]*?)\1(?!\w)/g, '$2');

  // Remove markdown links [text](url)
  sanitized = sanitized.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove common explanation phrases that aren't code
  const explanationPatterns = [
    /^Here's.*?:\s*/i,
    /^This.*?:\s*/i,
    /^The.*?:\s*/i,
    /^To.*?:\s*/i,
    /^You can.*?:\s*/i,
    /^I'll.*?:\s*/i,
    /^Let me.*?:\s*/i,
    /^First.*?:\s*/i,
    /^Now.*?:\s*/i,
    /^Next.*?:\s*/i,
    /^Finally.*?:\s*/i,
    /^Note:.*$/gmi,
    /^Explanation:.*$/gmi,
    /^Example:.*$/gmi
  ];

  explanationPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Only filter out obvious explanatory lines, be more permissive for code
  const lines = sanitized.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmedLine = line.trim();

    // Keep empty lines for code formatting
    if (!trimmedLine) return true;

    // Skip lines that are clearly explanatory text (be more conservative)
    const obviousExplanatoryPatterns = [
      /^(Here's|Here is|This is|The following|You can|I'll|Let me)\s/i,
      /^(Explanation|Example|Note):\s/i,
      /^(To complete|To fix|To add|To implement)/i,
      /\s+explanation\s*$/i
    ];

    const isObviousExplanation = obviousExplanatoryPatterns.some(pattern => pattern.test(trimmedLine));

    // Keep all lines except obvious explanations
    return !isObviousExplanation;
  });

  sanitized = filteredLines.join('\n');

  // Clean up extra whitespace while preserving code indentation
  sanitized = sanitized.replace(/\n\s*\n\s*\n/g, '\n\n');
  sanitized = sanitized.trim();

  return sanitized;
}