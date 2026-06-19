import logo from '../assets/khmer-cv-logo-user-small.png';

function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-brand">
          <img src={logo} alt="" width="34" height="34" />
          <div>
            <strong>Khmer-CV</strong>
            <span>Build a CV with confidence.</span>
          </div>
        </div>

        <div className="footer-copy">
          <p>© {year} Khmer-CV. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
