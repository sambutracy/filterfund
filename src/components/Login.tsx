import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Login: React.FC = () => {
  const { login, authenticated } = usePrivy();

  return (
    <div>
      {authenticated ? (
        <span>Logged In</span>
      ) : (
        <button onClick={() => login()}>Login with Privy</button>
      )}
    </div>
  );
};

export default Login;
