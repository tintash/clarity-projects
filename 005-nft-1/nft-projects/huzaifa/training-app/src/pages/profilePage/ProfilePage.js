import { useState, useEffect } from 'react';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';

import Table from '../../components/table/Table';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/footer/Footer';
import TokenCard from '../../components/token-card/TokenCard';
import MySpinner from '../../components/My-Spinner/MySpinner';
import { checkUserTokens, getUserTokens } from '../../helperFunctions';
import { INFO_TABLE_LABELS } from '../../constants';
import { getUserData } from '../../auth';

import './ProfilePage.scss';

const ProfilePage = () => {
  const [testnet] = useState(getUserData().profile.stxAddress.testnet);
  const [mainnet] = useState(getUserData().profile.stxAddress.mainnet);
  const [tokensOwned, setTokensOwned] = useState();
  const [userTokensList, setUserTokensList] = useState(null);
  const [tokensListLoading, setTokensListLoading] = useState(true);

  const callAsyncFunc = async () => {
    setTokensOwned(await checkUserTokens());
    setUserTokensList(await getUserTokens());
    setTokensListLoading(false);
  };

  const listener = async () => {
    const client = await connectWebSocketClient('http://localhost:3999');
    const sub = await client.subscribeAddressTransactions('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.velocity', (event) => {
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

  return (
    <div className="profile-outer-container">
      <NavBar />
      <div className="profile-container">
        <div className="profile-info-container fade-in">
          <h1 className="info-heading">Information</h1>
          <Table labels={INFO_TABLE_LABELS} values={[testnet, mainnet, tokensOwned]} />
        </div>
        <div className="profile-tokens-container fade-in">
          <h1 className="profile-tokens-heading">Tokens Owned</h1>
          <div className="profile-token-cards-container">
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

export default ProfilePage;
