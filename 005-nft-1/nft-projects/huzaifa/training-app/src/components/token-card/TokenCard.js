import './TokenCard.scss';

const TokenCard = ({
  tokenImage, tokenID, clickable, selected, setTokenSelected,
}) => {
  const clickHandler = () => {
    clickable ? selected ? setTokenSelected(0) : setTokenSelected(tokenID) : null;
  };

  return (
    <div className={`${selected ? 'selected' : ''} ${clickable ? 'hover' : ''} token-card`} onClick={() => clickHandler()}>
      <img
        src={`${tokenImage}`}
        alt="My Token"
        className="token-image"
      />
      <h1 className="token-id">{`Token ID: ${tokenID}`}</h1>
    </div>
  );
};
export default TokenCard;
