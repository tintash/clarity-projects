import { useState, useEffect } from 'react';

import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/footer/Footer';
import CustomButton from '../../components/custom-button/CustomButton';
import TokenCard from '../../components/token-card/TokenCard';
import tokens from '../../tokens';
import './BuyingPage.scss';
import { BUY_INFO_TEXT } from '../../styles/Strings';

const BuyingPage = () => {
  const [tokenSelected, setTokenSelected] = useState(0);
  const [buttonSelected, setButtonSelected] = useState(false);

  const handleClick = () => {
    setButtonSelected(!buttonSelected);
  };

  useEffect(() => {
    setButtonSelected(false);
  }, [tokenSelected]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="buy-outer-container">
      <NavBar />
      <div className="buy-container">
        <div className="buy-info-container fade-in">
          <h1 className="buy-heading">Buy tokens</h1>
          <p className="buy-paragraph">
            {
              tokenSelected === 0 ? BUY_INFO_TEXT : 'Seller ID: Srxvbyyeodkkfnfghsklaimd'
            }
          </p>
          {
            tokenSelected === 0 ? null : (
              <div className="buy-button">
                <CustomButton selected={buttonSelected} onClick={handleClick}>
                  Buy
                </CustomButton>
              </div>
            )
          }
        </div>
        <div className="buy-tokens-container fade-in">
          <h1 className="buy-tokens-heading">Tokens for sale</h1>
          <div className="buy-token-cards-container">
            {
          tokens.map((token) => (
            <TokenCard
              tokenImage={token.image}
              tokenID={token.id}
              clickable
              selected={token.id === tokenSelected}
              tokenSelected={tokenSelected}
              setTokenSelected={setTokenSelected}
            />
          ))
        }
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default BuyingPage;
