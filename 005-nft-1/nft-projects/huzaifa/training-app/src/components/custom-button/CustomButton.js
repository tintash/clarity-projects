import './CustomButtonStyle.scss';

const CustomButton = ({
  children, selected, disableBtn, ...otherProps
}) => (
  <button
    className={`${selected ? 'selected' : ''} ${
      disableBtn ? 'disable' : ''
    } custom-button`}
    disabled={`${disableBtn ? 'true' : ''}`}
    {...otherProps}
  >
    {children}
  </button>
);

export default CustomButton;
