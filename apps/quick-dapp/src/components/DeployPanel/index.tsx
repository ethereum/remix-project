import React, { useContext, useState } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import {
  deploy,
  emptyInstance,
  resetInstance,
  getInfoFromNatSpec,
} from '../../actions';
import { ThemeUI } from './theme';
import { CustomTooltip } from '@remix-ui/helper';
import { AppContext } from '../../contexts';

function DeployPanel(): JSX.Element {
  const { appState, dispatch } = useContext(AppContext);
  const { verified, natSpec } = appState.instance;
  const [formVal, setFormVal] = useState<any>({
    email: localStorage.getItem('__SURGE_EMAIL') || '',
    password: localStorage.getItem('__SURGE_PASSWORD') || '',
    subdomain: '',
    shortname: localStorage.getItem('__DISQUS_SHORTNAME') || '',
    shareTo: [],
  });
  const setShareTo = (type: string) => {
    let shareTo = formVal.shareTo;
    if (formVal.shareTo.includes(type)) {
      shareTo = shareTo.filter((item: string) => item !== type);
    } else {
      shareTo.push(type);
    }
    setFormVal({ ...formVal, shareTo });
  };
  const [deployState, setDeployState] = useState({
    code: '',
    error: '',
    loading: false,
  });
  return (
    <div className="col-3 d-inline-block">
      <h3 className="mb-3">QuickDapp Admin</h3>
      <Button
        onClick={() => {
          resetInstance();
        }}
      >
        Reset Functions
      </Button>
      <Button
        className="ml-3"
        onClick={() => {
          emptyInstance();
        }}
      >
        Delete Dapp
      </Button>
      <Alert variant="info" className="my-2">
        QuickDapp deploys to Surge.sh. Surge accounts are free until you reach a
        level of use. The email & password you input below will register you
        with a Surge account. The subdomain is your choice but it must be
        unique. More about{' '}
        <a target="_blank" href="https://surge.sh/help/">
          surge.sh
        </a>
      </Alert>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          setDeployState({ code: '', error: '', loading: true });
          deploy(formVal, (state: any) => {
            setDeployState({ ...state, loading: false });
          });
        }}
      >
        <Form.Group className="mb-2" controlId="formEmail">
          <Form.Label className="text-uppercase mb-0">Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Surge email"
            required
            value={formVal.email}
            onChange={(e) => {
              setFormVal({ ...formVal, email: e.target.value });
            }}
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="formPassword">
          <Form.Label className="text-uppercase mb-0">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Surge password"
            required
            value={formVal.password}
            onChange={(e) => {
              setFormVal({ ...formVal, password: e.target.value });
            }}
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="formPassword">
          <Form.Label className="text-uppercase mb-0">Subdomain</Form.Label>
          <InputGroup>
            <InputGroup.Text>https://</InputGroup.Text>
            <Form.Control
              type="subdomain"
              placeholder="Unique subdomain name"
              required
              value={formVal.subdomain}
              onChange={(e) => {
                setFormVal({ ...formVal, subdomain: e.target.value });
              }}
            />
            <InputGroup.Text>.surge.sh</InputGroup.Text>
          </InputGroup>
        </Form.Group>
        {/* <Form.Group className="mb-3" controlId="formShortname">
          <Form.Label>Disqus Shortname (Optional)</Form.Label>
          <Form.Control
            type="shortname"
            placeholder="Disqus Shortname"
            value={formVal.shortname}
            onChange={(e) => {
              setFormVal({ ...formVal, shortname: e.target.value });
            }}
          />
        </Form.Group> */}
        <Form.Group className="mb-2" controlId="formShareTo">
          <Form.Label className="text-uppercase mb-0">
            Share To (Optional)
          </Form.Label>
          <br />
          <div className="d-inline-flex align-items-center custom-control custom-checkbox">
            <input
              id="inline-checkbox-1"
              className="form-check-input custom-control-input"
              type="checkbox"
              name="group1"
              value="twitter"
              onChange={(e) => {
                setShareTo(e.target.value);
              }}
              checked={formVal.shareTo.includes('twitter')}
            />

            <label
              htmlFor="inline-checkbox-1"
              className="m-0 form-check-label custom-control-label"
              style={{ paddingTop: 1 }}
            >
              Twitter
            </label>
          </div>
          <div className="d-inline-flex align-items-center custom-control custom-checkbox ml-3">
            <input
              id="inline-checkbox-2"
              className="form-check-input custom-control-input"
              type="checkbox"
              name="group1"
              value="facebook"
              onChange={(e) => {
                setShareTo(e.target.value);
              }}
              checked={formVal.shareTo.includes('facebook')}
            />

            <label
              htmlFor="inline-checkbox-2"
              className="m-0 form-check-label custom-control-label"
              style={{ paddingTop: 1 }}
            >
              Facebook
            </label>
          </div>
        </Form.Group>
        <Form.Group className="mb-2" controlId="formShareTo">
          <Form.Label className="text-uppercase mb-0">
            Use NatSpec (Optional)
          </Form.Label>
          <br />
          <span
            data-id="remix_ai_switch"
            id="remix_ai_switch"
            className="btn ai-switch pl-0 py-0"
            onClick={async () => {
              getInfoFromNatSpec(!natSpec.checked);
            }}
          >
            <CustomTooltip
              placement="top"
              tooltipText="Retrieve info from the contract's NatSpec"
            >
              <i
                className={
                  natSpec.checked
                    ? 'fas fa-toggle-on fa-lg'
                    : 'fas fa-toggle-off fa-lg'
                }
              ></i>
            </CustomTooltip>
          </span>
        </Form.Group>
        <Form.Group className="mb-2" controlId="formVerified">
          <Form.Label className="text-uppercase mb-0">
            Verified by Etherscan (Optional)
          </Form.Label>
          <div className="d-flex py-1 align-items-center custom-control custom-checkbox">
            <input
              id="inline-checkbox-3"
              className="form-check-input custom-control-input"
              type="checkbox"
              onChange={(e) => {
                dispatch({
                  type: 'SET_INSTANCE',
                  payload: { verified: e.target.checked },
                });
              }}
              checked={verified}
            />

            <label
              htmlFor="inline-checkbox-3"
              className="m-0 form-check-label custom-control-label"
              style={{ paddingTop: 1 }}
            >
              Verified
            </label>
          </div>
        </Form.Group>
        <ThemeUI />
        <Button
          variant="primary"
          type="submit"
          className="mt-3"
          disabled={!formVal.email || !formVal.password || !formVal.subdomain}
        >
          {deployState.loading && (
            <i className="fas fa-spinner fa-spin mr-1"></i>
          )}
          Deploy
        </Button>
        {deployState.code === 'SUCCESS' && (
          <Alert variant="success" className="mt-4">
            Deployed successfully! <br /> Click the link below to view your dapp
            <br />
            <a
              target="_blank"
              href={`https://${formVal.subdomain}.surge.sh`}
            >{`https://${formVal.subdomain}.surge.sh`}</a>
          </Alert>
        )}
        {deployState.error && (
          <Alert variant="danger" className="mt-4">
            {deployState.error}
          </Alert>
        )}
      </Form>
    </div>
  );
}

export default DeployPanel;
