import React from 'react';
import '../index.css'; 

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dashboard-footer">
      <div className="footer-content">
        <p className="copyright">
          &copy; {currentYear} NexLink2l v2.0. All rights reserved.
        </p>
        <p className="development-credit">
          Developed by the{' '}
          <a 
            href="https://sathishmsdev.vercel.app/" 
            className="team-link"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Sathish S
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;