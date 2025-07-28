import React from 'react';

export interface ModernSettingsAIProps {
  toggles: any;
  onToggle: (key: string) => void;
}

export const ModernSettingsAI: React.FC<ModernSettingsAIProps> = ({ toggles, onToggle }) => (
  <div>
    <h4 className="text-white mb-4">Remix AI Assistant</h4>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">AI Copilot</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="aiCopilot2" checked={toggles.aiCopilot} onChange={() => onToggle('aiCopilot')} />
          <label className="custom-control-label" htmlFor="aiCopilot2">Provides AI-powered code suggestions directly in the editor.</label>
        </div>
        <a href="#" className="text-info small">Learn more about AI Copilot</a>
      </div>
    </div>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">Allow AI to Analyze Code Context</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="aiAnalyzeContext" checked={toggles.aiAnalyzeContext} onChange={() => onToggle('aiAnalyzeContext')} />
          <label className="custom-control-label" htmlFor="aiAnalyzeContext">Enables deeper insights by analyzing your code structure.</label>
        </div>
        <div className="text-warning small">Disabling this may reduce suggestion accuracy.</div>
      </div>
    </div>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">Use External API for AI Responses</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="aiExternalApi" checked={toggles.aiExternalApi} onChange={() => onToggle('aiExternalApi')} />
          <label className="custom-control-label" htmlFor="aiExternalApi">Sends anonymized prompts to OpenAI's API to enhance responses.</label>
        </div>
        <div className="text-warning small">Disabling this will limit AI-generated suggestions.</div>
      </div>
    </div>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">AI Privacy & Data Usage</h5>
        <a href="#" className="text-info small">View Privacy Policy</a>
      </div>
    </div>
  </div>
); 