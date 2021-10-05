import { useState, useEffect } from 'react';

import NavBar from '../../components/NavBar/NavBar';
import ActionCard from '../../components/action-card/ActionCard';
import CustomButton from '../../components/custom-button/CustomButton';
import Footer from '../../components/footer/Footer';
import { YOU_OWN_TEXT, BECOME_OWNER_TEXT } from '../../styles/Strings';
import './HomePage.scss';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  const listenToScroll = () => {
    const heightToShowFrom = 100;
    const winScroll = document.body.scrollTop
        || document.documentElement.scrollTop;

    if (winScroll > heightToShowFrom) {
      setIsVisible(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', listenToScroll);
    return () =>
      window.removeEventListener('scroll', listenToScroll);
  }, []);

  const handleProfileClick = () => {
    setSelected(!selected);
  };
  return (
    <div className="home-outter-container">
      <NavBar />
      <section className="section-profile">
        <div className="profile-container fade-in">
          <h1 className="profile-container-heading">
            {isOwner ? 'You are an' : 'Become an'}
            {' '}
            <span>owner</span>
          </h1>
          <p className="profile-container-text">
            {isOwner ? YOU_OWN_TEXT : BECOME_OWNER_TEXT}
          </p>
          <div className="profile-container-button">
            <CustomButton onClick={handleProfileClick} selected={selected}>
              My Profile &gt;
            </CustomButton>
          </div>
        </div>
      </section>
      <section className={`section-action ${isVisible ? ' fade-in-move-up' : 'invisible'}`}>
        <h1 className="section-action-heading">
          Deal your
          {' '}
          <span>Velocity Tokens</span>
          {' '}
          today
        </h1>
        <div className="action-cards">
          <ActionCard actionType="Claim" />
          <ActionCard actionType="Buy" />
          <ActionCard actionType="Sell" />
        </div>

      </section>
      <Footer />
    </div>
  );
};
export default HomePage;
