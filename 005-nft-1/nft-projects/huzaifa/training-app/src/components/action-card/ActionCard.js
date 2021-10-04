import { useState } from 'react';

import CustomButton from '../custom-button/CustomButton';
import buyImage from '../../images/buy.jpg';
import claimImage from '../../images/claim.jpg';
import sellImage from '../../images/sell.jpg';
import './ActionCard.scss';

const ActionCard = ({ actionType }) => {
  const [isSelected, setIsSelected] = useState(false);

  const clickHandler = () => {
    setIsSelected(!isSelected);
  };

  return (
    <div className="card-container">
      <img src={actionType === 'Buy' ? buyImage : actionType === 'Claim' ? claimImage : sellImage} alt="" className="card-image" />
      <h1 className="card-heading">
        {actionType}
        {' '}
        velocity tokens
      </h1>
      <p className="card-text">
        {
            actionType === 'Buy' ? 'Purchase your own unique velocity NFT. The procedure is simple, click below and become an owner of a one of a kind velocity NFT.' : actionType === 'Sell' ? 'Put your velocity NFTs for sale. Intersted buyers can then pay you the desired amount and become owners of your NFT.' : 'The first 1000 Velocity NFTs are absolutely free! You can hurry up and claim your NFTs and become part of our community!'
        }
      </p>
      <CustomButton selected={isSelected} onClick={clickHandler}>{actionType}</CustomButton>
    </div>
  );
};
export default ActionCard;
