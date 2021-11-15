import { Fa500Px } from 'react-icons/fa';
import './Footer.scss';

const Footer = () => (
  <footer className="footer">
    <ul className="footer-nav">
      <li className="footer-item">
        <a className="footer-link" href="/">About</a>
      </li>
      <li className="footer-item">
        <a className="footer-link" href="/">Pricing</a>
      </li>
      <li className="footer-item">
        <a className="footer-link" href="/">Terms of Use</a>
      </li>
      <li className="footer-item">
        <a className="footer-link" href="/">Privacy Policy</a>
      </li>
      <li className="footer-item">
        <a className="footer-link" href="/">Careers</a>
      </li>
      <li className="footer-item">
        <a className="footer-link" href="/">Blog</a>
      </li>
      <li className="footer-item">
        <a className="footer-link" href="/">Contact Us</a>
      </li>
    </ul>
    <Fa500Px className="footer-logo" />
    <p className="footer-copyright">
      &copy; Copyright by
      <a
        className="linkedin-link"
        target="_blank"
        href="https://www.linkedin.com/company/tintash/mycompany/"
        rel="noreferrer"
      >
        {' '}
        Tintash
      </a>
      . Use for learning or your portfolio. Do not claim
      as your own product.
    </p>
  </footer>
);

export default Footer;
