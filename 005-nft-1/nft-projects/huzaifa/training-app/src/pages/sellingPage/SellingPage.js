import { useState, useEffect } from 'react';

import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/footer/Footer';
import CustomButton from '../../components/custom-button/CustomButton';
import TokenCard from '../../components/token-card/TokenCard';
import tokens from '../../tokens';
import { getUserData } from '../../auth';

import './SellingPage.scss';

const SellingPage = () => {
  const [tokenId, setTokenId] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(10000);
  const [selected, setSelected] = useState(false);
  const listOfTokens = ['a', 'b', 'c'];
  const { testnet } = getUserData().profile.stxAddress;
  const { mainnet } = getUserData().profile.stxAddress;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // setSelected(!selected);
    alert('Form submitted');
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setTokenId(value);
  };

  return (
    <div className="sell-outer-container">
      <NavBar />
      <div className="sell-container">
        <div className="sell-info-container fade-in">
          <h1 className="sell-heading">Sell tokens</h1>
          <form onSubmit={handleSubmit} className="selling-form">
            <div className="form-row">
              <label className="form-label">Token ID</label>
              <select onChange={handleChange}>
                <option selected disabled value="">-Select From Tokens-</option>
                {listOfTokens?.length > 0
                  ? listOfTokens.map((token) => <option value={token}>{token}</option>)
                  : ''}
              </select>
            </div>

            <div className="form-row">
              <label className="form-label">
                Token Price &gt; 10000STX
              </label>
              <input
                type="number"
                value={tokenPrice}
                onChange={(s) => setTokenPrice(s.target.value)}
              />
            </div>

            <div className="sell-button">
              <CustomButton selected={selected}>Sell</CustomButton>
            </div>

          </form>
        </div>
        <div className="sell-tokens-container fade-in">
          <h1 className="sell-tokens-heading">My tokens for sale</h1>
          <div className="sell-token-cards-container">
            {
              tokens.map((token) => (
                <TokenCard
                  tokenImage={token.image}
                  tokenID={token.id}
                  clickable={false}
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

export default SellingPage;
