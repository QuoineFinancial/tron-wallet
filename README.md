# EOS HDWallet

![travis](https://travis-ci.org/cobowallet/eos-wallet.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/cobowallet/eos-wallet/badge.svg?branch=master)](https://coveralls.io/github/cobowallet/eos-wallet?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> JavaScript HDWallet for EOS blockchain, something like `ethereumjs-wallet`.

### EOS HDNode

You will create a EOS HDNode instance and use the methods of the instance:

**Static Methods:**

* `fromMasterSeed` - Create HD instance from a master seed
* `fromExtendedKey` - Create HD instance from a base58 string
* `fromMnemonic` - Create HD instance from a mnemonic
* `fromPrivateKey` - Create HD instance from a EOS private key, or WIF (Cannot derive or get xpriv, xpub in this way)
* `generateMnemonic` - Generate new mnemonic, or you can use `bip39` directly

**Instance Methods:**

* `derivePath` - Return a derived HD node instance use a path (`"m/44'/196'/0'/0/0"`)
* `deriveChild` - Return a derived HD node instance
* `getPrivateExtendedKey` - Return the private extend key (base58)
* `getPublicExtendedKey` - Return the public extend key (base58)
* `getAddress` - Return the EOS address (sometimes called pubkey in eosjs)
* `getPrivateKey` - Return the private key of the current node / address (sometimes called wif in eosjs)
* `generateTransaction` - `return Promise` - Generate a EOS raw transaction, param example:
```
{
  from: 'eosio',
  to: 'inita',
  amount: 100000, // will convert to '10.0000 EOS'
  memo: 'hello world',
  refBlockNum: 1, // get from eos.getInfo()
  refBlockPrefix: 452435776, // get from eos.getBlock(last_irrvertable_block)
  expiration: 60 // default is 60s
}
```

### Examples

See `test/test.js`
