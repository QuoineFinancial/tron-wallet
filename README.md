# Tron HDWallet

![travis](https://travis-ci.org/cobowallet/tron-wallet.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/cobowallet/tron-wallet/badge.svg?branch=master)](https://coveralls.io/github/cobowallet/tron-wallet?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

You will create a tron HD instance and use the methods of the instance:

```
yarn add @cobo/tron
```

**Static Methods:**

* `fromMasterSeed` - Create HD instance from a master seed
* `fromExtendedKey` - Create HD instance from a base58 string
* `fromMnemonic` - Create HD instance from a mnemonic
* `fromPrivateKey` - Create HD instance from a private key
* `generateMnemonic` - Generate new mnemonic, or you can use `bip39` directly

**Instance Methods:**

* `derivePath` - Return a derived HD node instance use a path (`"m/44'/194'/0'/0/0"`)
* `deriveChild` - Return a derived HD node instance
* `getPrivateExtendedKey` - Return the private extend key (base58)
* `getPublicExtendedKey` - Return the public extend key (base58)
* `getAddress` - Return the tron address
* `generateTransaction` - Return a tron transaction
  * `to` - the address you want to send to
  * `amount` - 1000000 = 1 TRX
  * `token` - default is TRX
  * `latestBlock` - lastest tron block from any api backend
* `freeze` - Freeze to get TRON power
  * `amount` - int, 1000000 = 1 TRX
  * `duration` - int, how many days, default is 3
  * `latestBlock` - lastest block info
* `unfreeze` - Unfreeze all the TRX
  * `latestBlock` - lastest block info

```JavaScript
const latestBlock = {
  hash: 'e996dc5c0ecc96773d31d1cdd6e9db3140cdfcd6fcdbaadfc65ab3e4ad7b352f',
  number: 195022,
  timestamp: 1527312435000
}
return Tron
  .fromMnemonic('alice loves bob')
  .generateTransaction(latestBlock, '27Vsbb84NX6hNgR7kAGwi74BAXV7TdCcHTp', 100000000)
```

### Examples

See `test/test.js`
