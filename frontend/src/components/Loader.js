import React from 'react';

const Loader = ({ text = 'Loading...' }) => (
  <div className="loader-wrap">
    <div className="spinner" />
    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{text}</p>
  </div>
);

export default Loader;
