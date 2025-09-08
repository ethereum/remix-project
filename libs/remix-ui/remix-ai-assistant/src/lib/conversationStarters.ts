export interface ConversationStarter {
  question: string;
  level: 'beginner' | 'intermediate' | 'expert';
  category: string;
}

export const CONVERSATION_STARTERS: ConversationStarter[] = [
  // Beginner Level (20 Questions)
  { question: "Python or JavaScript first?", level: "beginner", category: "programming" },
  { question: "What's a smart contract?", level: "beginner", category: "blockchain" },
  { question: "Git workflow tips?", level: "beginner", category: "development" },
  { question: "Favorite code editor?", level: "beginner", category: "tools" },
  { question: "Best programming tutorial?", level: "beginner", category: "learning" },
  { question: "What's DeFi?", level: "beginner", category: "blockchain" },
  { question: "VS Code extensions you use?", level: "beginner", category: "tools" },
  { question: "How do NFTs work?", level: "beginner", category: "blockchain" },
  { question: "Debugging strategies?", level: "beginner", category: "development" },
  { question: "What's a blockchain?", level: "beginner", category: "blockchain" },
  { question: "Frontend or backend preference?", level: "beginner", category: "programming" },
  { question: "Ethereum vs Bitcoin difference?", level: "beginner", category: "blockchain" },
  { question: "API vs library difference?", level: "beginner", category: "programming" },
  { question: "What's a crypto wallet?", level: "beginner", category: "blockchain" },
  { question: "Testing your code approach?", level: "beginner", category: "development" },
  { question: "Web3 vs Web2 difference?", level: "beginner", category: "blockchain" },
  { question: "Object-oriented vs functional?", level: "beginner", category: "programming" },
  { question: "What's a dApp?", level: "beginner", category: "blockchain" },
  { question: "Code review process?", level: "beginner", category: "development" },
  { question: "MetaMask usage experience?", level: "beginner", category: "blockchain" },

  // Intermediate Level (20 Questions)
  { question: "Solidity vs Rust for smart contracts?", level: "intermediate", category: "blockchain" },
  { question: "React hooks vs class components?", level: "intermediate", category: "programming" },
  { question: "Hardhat vs Foundry preference?", level: "intermediate", category: "tools" },
  { question: "Gas optimization techniques?", level: "intermediate", category: "blockchain" },
  { question: "GraphQL vs REST APIs?", level: "intermediate", category: "programming" },
  { question: "Layer 2 scaling solutions thoughts?", level: "intermediate", category: "blockchain" },
  { question: "Docker in development workflow?", level: "intermediate", category: "development" },
  { question: "Smart contract security practices?", level: "intermediate", category: "blockchain" },
  { question: "State management in React?", level: "intermediate", category: "programming" },
  { question: "IPFS implementation experience?", level: "intermediate", category: "blockchain" },
  { question: "TypeScript adoption benefits?", level: "intermediate", category: "programming" },
  { question: "DeFi protocol risks?", level: "intermediate", category: "blockchain" },
  { question: "Microservices vs monoliths?", level: "intermediate", category: "development" },
  { question: "Cross-chain bridge security?", level: "intermediate", category: "blockchain" },
  { question: "CI/CD pipeline setup?", level: "intermediate", category: "development" },
  { question: "Upgradeable contracts pros/cons?", level: "intermediate", category: "blockchain" },
  { question: "Database choice for dApps?", level: "intermediate", category: "development" },
  { question: "Wallet integration challenges?", level: "intermediate", category: "blockchain" },
  { question: "Smart contract testing frameworks?", level: "intermediate", category: "development" },
  { question: "Web3 authentication methods?", level: "intermediate", category: "blockchain" },

  // Expert Level (20 Questions)
  { question: "Account abstraction impact on UX?", level: "expert", category: "blockchain" },
  { question: "MEV protection strategies?", level: "expert", category: "blockchain" },
  { question: "ZK-rollups vs optimistic rollups?", level: "expert", category: "blockchain" },
  { question: "Formal verification tools worth it?", level: "expert", category: "development" },
  { question: "Intent-based architecture thoughts?", level: "expert", category: "blockchain" },
  { question: "Modular blockchain stacks future?", level: "expert", category: "blockchain" },
  { question: "Cross-chain messaging protocols?", level: "expert", category: "blockchain" },
  { question: "EIP-4844 blob space economics?", level: "expert", category: "blockchain" },
  { question: "Restaking security assumptions?", level: "expert", category: "blockchain" },
  { question: "AI-assisted smart contract auditing?", level: "expert", category: "development" },
  { question: "Maximal extractable value mitigation?", level: "expert", category: "blockchain" },
  { question: "Threshold cryptography applications?", level: "expert", category: "blockchain" },
  { question: "Verifiable delay functions usage?", level: "expert", category: "blockchain" },
  { question: "Proto-danksharding readiness?", level: "expert", category: "blockchain" },
  { question: "Homomorphic encryption in web3?", level: "expert", category: "blockchain" },
  { question: "Consensus mechanism evolution?", level: "expert", category: "blockchain" },
  { question: "Interchain security models?", level: "expert", category: "blockchain" },
  { question: "Decentralized sequencer designs?", level: "expert", category: "blockchain" },
  { question: "Proof aggregation scalability?", level: "expert", category: "blockchain" },
  { question: "Quantum-resistant cryptography timeline?", level: "expert", category: "blockchain" }
];

/**
 * Randomly samples one question from each difficulty level
 * @returns An array of 3 conversation starters (beginner, intermediate, expert)
 */
export function sampleConversationStarters(): ConversationStarter[] {
  const beginnerQuestions = CONVERSATION_STARTERS.filter(q => q.level === 'beginner');
  const intermediateQuestions = CONVERSATION_STARTERS.filter(q => q.level === 'intermediate');
  const expertQuestions = CONVERSATION_STARTERS.filter(q => q.level === 'expert');

  const randomBeginner = beginnerQuestions[Math.floor(Math.random() * beginnerQuestions.length)];
  const randomIntermediate = intermediateQuestions[Math.floor(Math.random() * intermediateQuestions.length)];
  const randomExpert = expertQuestions[Math.floor(Math.random() * expertQuestions.length)];

  return [randomBeginner, randomIntermediate, randomExpert];
}

/**
 * Gets conversation starters with seeded randomization for consistent results in same session
 * @param seed Optional seed for reproducible randomization
 * @returns An array of 3 conversation starters (beginner, intermediate, expert)
 */
export function sampleConversationStartersWithSeed(seed?: number): ConversationStarter[] {
  const seededRandom = (seedValue: number) => {
    const x = Math.sin(seedValue) * 10000;
    return x - Math.floor(x);
  };

  const actualSeed = seed ?? Date.now();
  
  const beginnerQuestions = CONVERSATION_STARTERS.filter(q => q.level === 'beginner');
  const intermediateQuestions = CONVERSATION_STARTERS.filter(q => q.level === 'intermediate');
  const expertQuestions = CONVERSATION_STARTERS.filter(q => q.level === 'expert');

  const randomBeginner = beginnerQuestions[Math.floor(seededRandom(actualSeed) * beginnerQuestions.length)];
  const randomIntermediate = intermediateQuestions[Math.floor(seededRandom(actualSeed + 1) * intermediateQuestions.length)];
  const randomExpert = expertQuestions[Math.floor(seededRandom(actualSeed + 2) * expertQuestions.length)];

  return [randomBeginner, randomIntermediate, randomExpert];
}

