import { useState, useEffect } from 'react';
import { Pagination } from 'antd';

import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/footer/Footer';
import CustomButton from '../../components/custom-button/CustomButton';
import TokenCard from '../../components/token-card/TokenCard';
import MySpinner from '../../components/My-Spinner/MySpinner';
import Table from '../../components/table/Table';
import './BuyingPage.scss';
import { BUY_INFO_TEXT, BUY_OWN_TOKEN_TEXT, CAN_NOT_BUY_TEXT } from '../../styles/Strings';
import { getAllTokens, checkForSale, buyToken } from '../../helperFunctions';
import { getUserData } from '../../auth';

const BuyingPage = () => {
  const [tokenSelected, setTokenSelected] = useState(0);
  const [tokenDetailsLoading, setTokenDetailsLoading] = useState(false);
  const [sellerID, setSellerID] = useState('');
  const [tokenPrice, setTokenPrice] = useState(0);
  const [buttonSelected, setButtonSelected] = useState(false);
  const [listOfTokens, setListOfTokens] = useState([]);
  const [tokensListLoading, setTokensListLoading] = useState(true);
  const [currListPage, setCurrListPage] = useState(1);

  const handleClick = async () => {
    setButtonSelected(!buttonSelected);
    await buyToken(tokenSelected, tokenPrice, setButtonSelected);
  };

  useEffect(() => {
    setButtonSelected(false);
  }, [tokenSelected]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const callAsyncFunc = async () => {
      setListOfTokens(await getAllTokens(currListPage));
      setTokensListLoading(false);
    };
    callAsyncFunc();
  }, []);

  const getTokenDetails = async (tokenId) => {
    setTokenDetailsLoading(true);
    setTokenSelected(tokenId);
    const { price, sellerId } = await checkForSale(tokenId);
    setTokenPrice(price);
    setSellerID(sellerId);
    setTimeout(() => setTokenDetailsLoading(false), 500);
  };

  const onChange = async (pageNumber) => {
    setCurrListPage(pageNumber);
    setTokensListLoading(true);
    setListOfTokens(await getAllTokens(pageNumber));
    setTokensListLoading(false);
  };

  return (
    <div className="buy-outer-container">
      <NavBar />
      <div className="buy-container">
        <div className="buy-info-container fade-in">
          <h1 className="buy-heading">Buy tokens</h1>
          {
              !tokenDetailsLoading ? tokenSelected === 0 ? (
                <p className="buy-paragraph fade-in">
                  {BUY_INFO_TEXT}
                </p>
              ) : sellerID === getUserData().profile.stxAddress.testnet
                ? (
                  <p className="buy-paragraph fade-in">
                    {BUY_OWN_TOKEN_TEXT}
                  </p>
                )
                : tokenPrice === 0
                  ? (
                    <p className="buy-paragraph fade-in">
                      {CAN_NOT_BUY_TEXT}
                    </p>
                  )
                  : <Table labels={['Seller ID', 'Price']} values={[sellerID, tokenPrice]} />
                : <MySpinner />
          }
          {
            !tokenDetailsLoading ? tokenSelected === 0
              || sellerID === getUserData().profile.stxAddress.testnet
              || tokenPrice === 0
              ? null : (
                <div className="buy-button">
                  <CustomButton selected={buttonSelected} onClick={handleClick}>
                    Buy
                  </CustomButton>
                </div>
              ) : ''
          }
        </div>
        <div className="buy-tokens-container fade-in">
          <h1 className="buy-tokens-heading">Tokens for sale</h1>
          <div className="buy-token-cards-container">
            {
          !tokensListLoading ? listOfTokens.length > 0 ? listOfTokens.map((token) => (
            <TokenCard
              key={token.id}
              tokenImage={token.image}
              tokenID={token.id}
              clickable
              selected={token.id === tokenSelected}
              tokenSelected={tokenSelected}
              getTokenDetails={getTokenDetails}
              setTokenSelected={setTokenSelected}
            />
          ))
            : <h1 className="buy-token-cards-container-message fade-in">No tokens available to purchase</h1>
            : <MySpinner />
        }
          </div>
          <Pagination
            className="pagination"
            defaultCurrent={currListPage}
            total={1000}
            onChange={onChange}
            pageSizeOptions={[]}
            defaultPageSize="25"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default BuyingPage;
