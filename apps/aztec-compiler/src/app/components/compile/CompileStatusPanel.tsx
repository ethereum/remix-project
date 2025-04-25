import { Alert, Button } from 'react-bootstrap';

export const CompileStatusPanel = ({
  loading,
  queuePosition,
  checkQueueStatus,
}: {
  loading: boolean;
  queuePosition: number | null;
  checkQueueStatus: () => void;
}) => {
  if (!loading) return null;

  return (
    <div className="mt-3" style={{ marginTop: '10px' }}>
      <div className="d-flex align-items-center justify-content-between">
        <Button size="sm" variant="outline-primary" onClick={checkQueueStatus}>
          Check Compile Order
        </Button>
      </div>
      {queuePosition !== null && (
        <Alert
          variant="info"
          className="mt-2"
          style={{
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            fontSize: '12px',
          }}
        >
          You're currently <strong>#{queuePosition + 1}</strong> in the queue.<br />
        </Alert>
      )}
    </div>
  );
};
