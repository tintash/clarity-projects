import { useState, useEffect } from 'react';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';

import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/footer/Footer';
import CustomButton from '../../components/custom-button/CustomButton';
import TokenCard from '../../components/token-card/TokenCard';
import MySpinner from '../../components/My-Spinner/MySpinner';
import { getUserTokens, sellToken } from '../../helperFunctions';

import './SellingPage.scss';

const SellingPage = () => {
  const [userTokens, setUserTokens] = useState(null);
  const [tokenId, setTokenId] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(10000);
  const [selected, setSelected] = useState(false);
  const [userTokensList, setUserTokensList] = useState(null);
  const [tokensListLoading, setTokensListLoading] = useState(true);

  const callAsyncFunc = async () => {
    setUserTokens(await getUserTokens());
    setUserTokensList(await getUserTokens());
    setTokensListLoading(false);
  };

  const listener = async () => {
    const client = await connectWebSocketClient('http://localhost:3999');
    const sub = await client.subscribeAddressTransactions('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.velocity-market', (event) => {
      if (event.tx_status === 'success') {
        callAsyncFunc();
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    listener();
    callAsyncFunc();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSelected(!selected);
    await sellToken(tokenId, tokenPrice, setSelected);
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
              <select onChange={handleChange} defaultValue="-Select From Tokens-">
                <option disabled value="-Select From Tokens-">-Select From Tokens-</option>
                {userTokens?.length > 0
                  ? userTokens.map((token) =>
                    <option key={token.id} value={token.id}>{token.id}</option>)
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
          <h1 className="sell-tokens-heading">My tokens</h1>
          <div className="sell-token-cards-container">
            {
              !tokensListLoading ? userTokensList.length > 0 ? userTokensList.map((token) =>
                (
                  <TokenCard
                    key={token.id}
                    tokenImage={token.url}
                    tokenID={token.id}
                    clickable={false}
                  />
                ))
                : <h1 className="profile-token-cards-container-message fade-in">You do not own any tokens</h1>
                : <MySpinner />
            }
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellingPage;
