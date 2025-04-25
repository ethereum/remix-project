import { Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';

export const TargetProjectSelector = ({
  projectList,
  targetProject,
  setTarget,
  onReload,
}: {
  projectList: string[];
  targetProject: string;
  setTarget: (e: React.ChangeEvent<any>) => void;
  onReload: () => void;
}) => {
  return (
    <Form.Group className="mt-3" style={{ marginTop: '10px' }}>
      <Form.Text className="text-muted">
        <small>TARGET PROJECT </small>
        <OverlayTrigger placement="top" overlay={<Tooltip id={''}>Reload</Tooltip>}>
          <span style={{ cursor: 'pointer' }} onClick={onReload}>
          </span>
        </OverlayTrigger>
      </Form.Text>
      <InputGroup className="mt-2">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={''}>
              The project must be located under the `aztec` folder in the root directory.
            </Tooltip>
          }
        >
          <Form.Control
            className="custom-select"
            as="select"
            value={targetProject}
            onChange={setTarget}
          >
            <option value="">-- Select Project --</option>
            {projectList.map((projectName, idx) => (
              <option key={idx} value={projectName}>
                {projectName}
              </option>
            ))}
          </Form.Control>
        </OverlayTrigger>
      </InputGroup>
    </Form.Group>
  );
};
