import React, { useState } from 'react';

const GetDeviceCode = () => {
  const [userCode, setUserCode] = useState(null);

  const requestDeviceCode = async () => {
    const response = await fetch('http://localhost:3000/github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: 'dccbc48453f7afa34fad',
        scope: 'repo', // or another appropriate scope
      }),
    });

    const data = await response.json();
    setUserCode(data.user_code); // Store user code to show to the user
  };

  return (
    <div>
      <button onClick={requestDeviceCode}>Get Device Code</button>
      {userCode && <div>User Code: {userCode}</div>}
    </div>
  );
};

export default GetDeviceCode;
