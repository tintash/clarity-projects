import { useEffect } from 'react';

import Table from '../../components/table/Table';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/footer/Footer';
import { INFO_TABLE_LABELS, INFO_TABLE_VALUES } from '../../constants';
import { getUserData } from '../../auth';

import './ProfilePage.scss';

const ProfilePage = () => {
  const { testnet } = getUserData().profile.stxAddress;
  const { mainnet } = getUserData().profile.stxAddress;
  INFO_TABLE_VALUES[0] = testnet;
  INFO_TABLE_VALUES[1] = mainnet;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="profile-outer-container">
      <NavBar />
      <div className="profile-container">
        <div className="profile-info-container fade-in">
          <h1 className="info-heading">Information</h1>
          <Table labels={INFO_TABLE_LABELS} values={INFO_TABLE_VALUES} />
        </div>
        <div className="info-tokens-container fade-in">
          <h1 className="info-tokens-heading">Tokens Purchased</h1>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
