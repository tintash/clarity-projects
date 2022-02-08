### Overview

This application implements nodejs backend for FT DAO contract on mocknet.

### Run

1. clone & open in vs
2. `yarn install`
3. `yarn build`
3. install extension for REST requests
   - `code --install-extension humao.rest-client`
4. `clarinet integrate` in new terminal tab. Wait while docker containers will start and 2nd block with contracts will be deployed to blockchain
5. `yarn start`
5. open [request.rest](requests.rest) file and click the "Send Request" button against a request

### Update mnemonic

Application has a default mnemonic, which is used to generate private key that is used for transaction signing. You can add your mnemonic here for e.g. before calling `completeTransaction` request
http://localhost:3000/contractAPI/setMnemonic?mnemonic="inside claim ...."
