import { useState } from 'react';

import NavBar from '../../components/NavBar/NavBar';
import CustomButton from '../../components/custom-button/CustomButton';
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
      {/* <section className="section-action">
        <div className="buy-card">
          <img src="../../images/buy.jpg" alt="" className="buy-image" />
        </div>
      </section> */}
    </div>
  );
};
export default HomePage;
