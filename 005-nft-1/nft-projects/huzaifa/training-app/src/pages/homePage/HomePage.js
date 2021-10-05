import { useState } from 'react';

import NavBar from '../../components/NavBar/NavBar';
import ActionCard from '../../components/action-card/ActionCard';
import CustomButton from '../../components/custom-button/CustomButton';
import myImage from '../../images/buy.jpg';
import './HomePage.scss';

const HomePage = () => {
  const [selected, setSelected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa ipsam
            asperiores dolores, aliquid dolor impedit nam recusandae vero assumenda
            sed architecto similique, laboriosam, debitis error. Sunt laborum
            tempore eum sit.
          </p>
          <div className="profile-container-button">
            <CustomButton onClick={handleProfileClick} selected={selected}>
              Check Profile &gt;
            </CustomButton>
          </div>
        </div>
      </section>
      <section className="section-action">
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
    </div>
  );
};
export default HomePage;
