import { useEffect } from 'react';

import Table from '../../components/table/Table';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/footer/Footer';
import { INFO_TABLE_LABELS, INFO_TABLE_VALUES } from '../../constants';
import { getUserData } from '../../auth';

import './SellingPage.scss';

const SellingPage = () => {
  const { testnet } = getUserData().profile.stxAddress;
  const { mainnet } = getUserData().profile.stxAddress;
  INFO_TABLE_VALUES[0] = testnet;
  INFO_TABLE_VALUES[1] = mainnet;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="sell-outer-container">
      <NavBar />
      <div className="sell-container">
        <div className="sell-info-container fade-in">
          <h1 className="sell-heading">Sell tokens</h1>
          <Table labels={INFO_TABLE_LABELS} values={INFO_TABLE_VALUES} />
        </div>
        <div className="sell-tokens-container fade-in">
          <h1 className="sell-tokens-heading">Tokens up for sale</h1>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellingPage;
