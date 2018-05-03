# Tron HDWallet

![travis](https://travis-ci.org/cobowallet/tron-wallet.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/cobowallet/tron-wallet/badge.svg?branch=master)](https://coveralls.io/github/cobowallet/tron-wallet?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

You will create a tron HD instance and use the methods of the instance:

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
* `getAccount` - Return the tron account (`{privateKey, address, password}`)
* `getBalance` - Return balance of the account

### Examples

See `test/test.js`
