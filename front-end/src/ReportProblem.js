import React from 'react';
import { Link } from 'react-router-dom';

export default function ReportProblem() {
  return (
    <div style={{padding:40, marginTop:80}}>
      <h2>Report a Problem</h2>
      <p>Use this page to send feedback or report issues.</p>
      <Link to="/settings">← Back to Settings</Link>
    </div>
  );
}
