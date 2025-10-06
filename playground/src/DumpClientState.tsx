import React, { useEffect, useState } from 'react';
import { useInternalAgencyClient } from '../../src';

export const DumpClientState = () => {

  const { client, error, initializing, initialized } = useInternalAgencyClient();

  const [frid, setFrid] = useState<string | undefined>(undefined);

  useEffect(() => {
    console.log('useEffect');
    setFrid(client?.fridStore.getFrid());
  }, [client, initialized, initializing]);

  async function resetFrid() {
    if (!client) return;

    client.fridStore.setFrid('');
    await client.saveEvent('reset_frid');
    setFrid(client.fridStore.getFrid());
  }

  return <>
    <h1>Client state</h1>
    <p>initializing: {initializing ? 'true' : 'false'}</p>
    <p>initialized: {initialized ? 'true' : 'false'}</p>
    <p>error: <pre><code>{JSON.stringify(error)}</code></pre></p>
    <p>frid: {frid}</p>
    <button onClick={() => setFrid(client?.fridStore.getFrid())}>fetch frid</button>
    <button onClick={() => resetFrid()}>reset frid</button>
  </>;
};
