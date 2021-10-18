import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBrIhqXBHXQ29IxWWUl5omleF4Y4umqFIY',
  authDomain: 'velocity-nft.firebaseapp.com',
  databaseURL: 'https://velocity-nft.firebaseio.com',
  storageBucket: 'velocity-nft.appspot.com',
};
const firebaseApp = initializeApp(firebaseConfig);

const storage = getStorage(firebaseApp);

const loadImage = async (tokenId) => {
  try {
    const url = await getDownloadURL(ref(storage, `NFT/${tokenId}.png`));
    return url;
  } catch (error) {
    console.log(error);
  }
};

export default loadImage;
