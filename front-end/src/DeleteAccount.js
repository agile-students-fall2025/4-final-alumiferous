import React from 'react';
import { Link } from 'react-router-dom';

export default function DeleteAccount() {
  return (
    <div style={{padding:40, marginTop:80}}>
      <h2>Delete Account</h2>
      <p>This action is irreversible. This is a placeholder confirmation screen.</p>
      <Link to="/settings">← Back to Settings</Link>
    </div>
  );
}
