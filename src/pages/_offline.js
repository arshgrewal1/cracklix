
import React from 'react';
import Head from 'next/head';

const OfflinePage = () => (
  <>
    <Head>
      <title>Offline | Cracklix</title>
    </Head>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#f1f1f1',
      fontFamily: 'sans-serif'
    }}>
      <h1>You are Offline</h1>
      <p>It seems you are not connected to the internet. Please check your connection and try again.</p>
    </div>
  </>
);

export default OfflinePage;
