import { Form, InputGroup, Button } from 'react-bootstrap';

export const ImportExampleSelector = ({
  examples,
  exampleToImport,
  setExampleToImport,
  importExample,
}: {
  examples: string[];
  exampleToImport: string;
  setExampleToImport: (v: string) => void;
  importExample: (v: string) => void;
}) => {
  return (
    <Form.Group>
      <Form.Text className="text-muted">
        <small>IMPORT EXAMPLE PROJECT</small>
      </Form.Text>
      <InputGroup className="mt-2">
        <Form.Control
          className="custom-select"
          as="select"
          value={exampleToImport}
          onChange={(e) => setExampleToImport(e.target.value)}
        >
          <option value="">-- Select Example --</option>
          {examples.map((exampleName) => (
            <option key={exampleName} value={exampleName}>
              {exampleName}
            </option>
          ))}
        </Form.Control>
      </InputGroup>
      <Button
        className="w-100 mt-2"
        variant="secondary"
        disabled={!exampleToImport}
        onClick={() => importExample(exampleToImport)}
      >
        Import Selected Example
      </Button>
    </Form.Group>
  );
};
