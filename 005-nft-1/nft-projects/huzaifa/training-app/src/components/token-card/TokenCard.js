import './TokenCard.scss';

const TokenCard = ({
  tokenImage, tokenID, clickable, selected, getTokenDetails, setTokenSelected,
}) => {
  const clickHandler = () => {
    clickable ? selected ? setTokenSelected(0) : getTokenDetails(tokenID) : null;
  };

  return (
    <div className={`${selected ? 'selected' : ''} ${clickable ? 'hover' : ''} token-card`} onClick={() => clickHandler()}>
      <img
        src={`${tokenImage}`}
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://firebasestorage.googleapis.com/v0/b/velocity-nft.appspot.com/o/NFT%2F3.png?alt=media&token=7a79153c-31f6-4fe3-b524-9ae7c389f790'; }}
        alt=" "
        className="token-image"
      />
      <h1 className="token-id">{`Token ID: ${tokenID}`}</h1>
    </div>
  );
};
export default TokenCard;
