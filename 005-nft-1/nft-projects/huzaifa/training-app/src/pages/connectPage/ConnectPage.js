import { useState } from 'react';

import { authenticate } from '../../auth';
import CustomButton from '../../components/custom-button/CustomButton';
import './ConnectPage.scss';

const ConnectPage = () => {
  const [selected, setSelected] = useState(false);

  const handleClick = () => {
    if (!selected) {
      authenticate(setSelected);
    }
    setSelected(!selected);
  };

  return (
    <div className="outter-container">
      <div className="content-container fade-in-move-up">
        <div className="text-container">
          <h2>Welcome to</h2>
          <h1 className="website-title">Velocity Market</h1>
          <p>
            Your one-stop-shop to
            {' '}
            <span>buy</span>
            ,
            {' '}
            <span>sell</span>
            , and
            {' '}
            <span>claim</span>
            {' '}
            Velocity Tokens
          </p>
        </div>
        <div className="button-container">
          <CustomButton onClick={handleClick} selected={selected}>
            Connect to wallet
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
