import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import CustomButton from '../custom-button/CustomButton';
import buyImage from '../../images/buy.jpg';
import claimImage from '../../images/claim.jpg';
import sellImage from '../../images/sell.jpg';
import { claimTokens } from '../../helperFunctions';
import { BUY_CARD_TEXT, SELL_CARD_TEXT, CLAIM_CARD_TEXT } from '../../styles/Strings';
import './ActionCard.scss';

const ActionCard = ({ actionType }) => {
  const [isSelected, setIsSelected] = useState(false);
  const history = useHistory();

  const handleClaim = async () => {
    await claimTokens(setIsSelected);
  };

  const clickHandler = () => {
    setIsSelected(!isSelected);
    actionType === 'Buy' ? history.push('/buy') : actionType === 'Claim' ? handleClaim() : history.push('/sell');
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
            actionType === 'Buy' ? BUY_CARD_TEXT : actionType === 'Sell' ? SELL_CARD_TEXT : CLAIM_CARD_TEXT
        }
      </p>
      <CustomButton selected={isSelected} onClick={clickHandler}>{actionType}</CustomButton>
    </div>
  );
};
export default ActionCard;
