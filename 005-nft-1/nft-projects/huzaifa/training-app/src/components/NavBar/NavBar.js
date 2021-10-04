import { Fa500Px, FaSignOutAlt } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';

import { userSession } from '../../auth';
import './NavBar.scss';

const NavBar = () => {
  const history = useHistory();

  const handleDisconnectClick = () => {
    userSession.signUserOut();
    window.location.reload();
  };

  const handleLogoClick = () => {
    history.push('/home');
  };

  return (
    <div className="nav-bar-container">
      <Fa500Px className="app-logo" onClick={handleLogoClick} />
      <h1 className="app-name">Training Application</h1>
      <div className="disconnect-wallet" onClick={handleDisconnectClick}>
        <FaSignOutAlt className="disconnect-logo" />
        <p className="disconnect-text">Disconnect</p>
      </div>
    </div>
  );
};

export default NavBar;
