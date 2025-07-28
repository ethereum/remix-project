import React from 'react';

export interface ModernSettingsServicesProps {
  toggles: any;
  inputs: any;
  onToggle: (key: string) => void;
  onInput: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const ModernSettingsServices: React.FC<ModernSettingsServicesProps> = ({ toggles, inputs, onToggle, onInput }) => (
  <div>
    <h4 className="text-white mb-4">Connected Services</h4>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">Github Credentials</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="githubEnabled" checked={toggles.githubEnabled} onChange={() => onToggle('githubEnabled')} />
          <label className="custom-control-label" htmlFor="githubEnabled">Enable Github Integration</label>
        </div>
        <div className="form-row">
          <div className="form-group col-md-4">
            <label>Token</label>
            <input type="password" className="form-control" name="githubToken" value={inputs.githubToken} onChange={onInput} />
          </div>
          <div className="form-group col-md-4">
            <label>Username</label>
            <input type="text" className="form-control" name="githubUsername" value={inputs.githubUsername} onChange={onInput} />
          </div>
          <div className="form-group col-md-4">
            <label>Email</label>
            <input type="email" className="form-control" name="githubEmail" value={inputs.githubEmail} onChange={onInput} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm mr-2">Save</button>
      </div>
    </div>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">IPFS Settings</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="ipfsEnabled" checked={toggles.ipfsEnabled} onChange={() => onToggle('ipfsEnabled')} />
          <label className="custom-control-label" htmlFor="ipfsEnabled">Enable IPFS Integration</label>
        </div>
        <div className="form-row">
          <div className="form-group col-md-2">
            <label>Host</label>
            <input type="text" className="form-control" name="ipfsHost" value={inputs.ipfsHost} onChange={onInput} />
          </div>
          <div className="form-group col-md-2">
            <label>Protocol</label>
            <input type="text" className="form-control" name="ipfsProtocol" value={inputs.ipfsProtocol} onChange={onInput} />
          </div>
          <div className="form-group col-md-2">
            <label>Port</label>
            <input type="text" className="form-control" name="ipfsPort" value={inputs.ipfsPort} onChange={onInput} />
          </div>
          <div className="form-group col-md-3">
            <label>Project ID (Infura)</label>
            <input type="text" className="form-control" name="ipfsProjectId" value={inputs.ipfsProjectId} onChange={onInput} />
          </div>
          <div className="form-group col-md-3">
            <label>Project Secret (Infura)</label>
            <input type="password" className="form-control" name="ipfsProjectSecret" value={inputs.ipfsProjectSecret} onChange={onInput} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm">Save</button>
      </div>
    </div>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">Swarm Settings</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="swarmEnabled" checked={toggles.swarmEnabled} onChange={() => onToggle('swarmEnabled')} />
          <label className="custom-control-label" htmlFor="swarmEnabled">Enable Swarm Integration</label>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Private Bee Address</label>
            <input type="text" className="form-control" name="swarmBee" value={inputs.swarmBee} onChange={onInput} />
          </div>
          <div className="form-group col-md-6">
            <label>Postage Stamp ID</label>
            <input type="text" className="form-control" name="swarmStamp" value={inputs.swarmStamp} onChange={onInput} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm">Save</button>
      </div>
    </div>
    <div className="card bg-dark text-light mb-4">
      <div className="card-body">
        <h5 className="card-title">Sindri Credentials</h5>
        <div className="custom-control custom-switch mb-3">
          <input type="checkbox" className="custom-control-input" id="sindriEnabled" checked={toggles.sindriEnabled} onChange={() => onToggle('sindriEnabled')} />
          <label className="custom-control-label" htmlFor="sindriEnabled">Enable Sindri Integration</label>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Token</label>
            <input type="password" className="form-control" name="sindriToken" value={inputs.sindriToken} onChange={onInput} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm">Save</button>
      </div>
    </div>
  </div>
); 