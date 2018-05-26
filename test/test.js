// const assert = require('assert')
const bip39 = require('bip39')
const TronWallet = require('../')
const mnemonic = 'cobo wallet is awesome'
const assert = require('assert')
const seed = bip39.mnemonicToSeedHex(mnemonic)

describe('Tron Wallet', function () {
  const node = TronWallet.fromMasterSeed(seed)

  it('Can get tron account from HD wallet structure', () => {
    assert.equal(node.getAddress(), '27QXjqR1iz6DhRNPj9PXx7W6h6NwM3r4gT2')
    assert.equal(node.getTronPrivateKey(), '2EBF15FCEF9CEF30CA13731FD08CEB6F4F7C5E1C2A5794977068FD9BAC2E2DAC')
  })

  it('Can generate new mnemonic and import', () => {
    const myMnemonic = TronWallet.generateMnemonic()
    const node = TronWallet.fromMnemonic(myMnemonic)
    assert(node.getAddress())
  })

  it('Can import from base58 string', () => {
    const node = TronWallet.fromExtendedKey('xprv9s21ZrQH143K27GwrJ5SPAZc9KPn8i8gkjeXcQe5vPtRPgUDyoq8qrh4qCRPwZAxzP8abdc9nZduW7UDYN1B5V6rjhc3YPMXzr9ArHaM4M6')
    assert(node.getAddress())
  })

  it('Can derive to child nodes and get address', () => {
    const parentNode = TronWallet.fromMasterSeed(seed)
    const node1 = parentNode.derivePath("m/44'/194'/0'/0/0")
    assert.equal(node1.getAddress(), '27Vsbb84NX6hNgR7kAGwi74BAXV7TdCcHTp')
    const node2 = parentNode.deriveChild(0)
    assert.equal(node2.getAddress(), '27Qy2jqg5KLzwKxz4HYxabqqiEkAkBWb4aN')
  })

  it('Cen generate transaction offline', () => {
    const latestBlock = {
      hash: 'e996dc5c0ecc96773d31d1cdd6e9db3140cdfcd6fcdbaadfc65ab3e4ad7b352f',
      number: 195022,
      timestamp: 1527312435000
    }
    return node.generateTransaction(latestBlock, '27Vsbb84NX6hNgR7kAGwi74BAXV7TdCcHTp', 100000000)
  })
})
