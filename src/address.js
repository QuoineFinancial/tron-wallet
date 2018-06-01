// credit - https://github.com/tronprotocol/node-wallet-api
import sha3 from 'js-sha3'
import bs58 from 'bs58'
import Jssha from 'jssha'
const EC = require('elliptic').ec

const prefixTestNet = 'a0'
const prefix = '41'

export function computeAddress (pubBytes, isTestNet = false) {
  if (pubBytes.length === 65) {
    pubBytes = pubBytes.slice(1)
  }
  var hash = sha3.keccak256(pubBytes).toString()
  var addressHex = hash.substring(24)
  addressHex = (isTestNet ? prefixTestNet : prefix) + addressHex
  var addressBytes = hexStr2byteArray(addressHex)
  return addressBytes
}

export function getBase58CheckAddress (addressBytes) {
  var hash0 = SHA256(addressBytes)
  var hash1 = SHA256(hash0)
  var checkSum = hash1.slice(0, 4)
  checkSum = addressBytes.concat(checkSum)
  var base58Check = bs58.encode(checkSum)
  return base58Check
}

export function getPubKeyFromPriKey (priKeyBytes) {
  var ec = new EC('secp256k1')
  var key = ec.keyFromPrivate(priKeyBytes, 'bytes')
  var pubkey = key.getPublic()
  var x = pubkey.x
  var y = pubkey.y
  var xHex = x.toString('hex')
  while (xHex.length < 64) {
    xHex = '0' + xHex
  }
  var yHex = y.toString('hex')
  while (yHex.length < 64) {
    yHex = '0' + yHex
  }
  var pubkeyHex = '04' + xHex + yHex
  var pubkeyBytes = hexStr2byteArray(pubkeyHex)
  return pubkeyBytes
}

function byte2hexStr (byte) {
  var hexByteMap = '0123456789ABCDEF'
  var str = ''
  str += hexByteMap.charAt(byte >> 4)
  str += hexByteMap.charAt(byte & 0x0f)
  return str
}

export function byteArray2hexStr (byteArray) {
  let str = ''
  for (let i = 0; i < (byteArray.length); i++) {
    str += byte2hexStr(byteArray[i])
  }
  return str
}

function isHexChar (c) {
  if ((c >= 'A' && c <= 'F') ||
      (c >= 'a' && c <= 'f') ||
      (c >= '0' && c <= '9')) {
    return 1
  }
  return 0
}

function hexChar2byte (c) {
  var d = 0
  if (c >= 'A' && c <= 'F') {
    d = c.charCodeAt(0) - 'A'.charCodeAt(0) + 10
  } else if (c >= 'a' && c <= 'f') {
    d = c.charCodeAt(0) - 'a'.charCodeAt(0) + 10
  } else if (c >= '0' && c <= '9') {
    d = c.charCodeAt(0) - '0'.charCodeAt(0)
  }
  return d
}

export function hexStr2byteArray (str) {
  var byteArray = []
  var d = 0
  var j = 0
  var k = 0

  for (let i = 0; i < str.length; i++) {
    var c = str.charAt(i)
    if (isHexChar(c)) {
      d <<= 4
      d += hexChar2byte(c)
      j++
      if ((j % 2) === 0) {
        byteArray[k++] = d
        d = 0
      }
    }
  }
  return byteArray
}

export function longToByteArray (/* long */long) {
  // we want to represent the input as a 8-bytes array
  var byteArray = [0, 0, 0, 0, 0, 0, 0, 0]

  for (var index = 0; index < byteArray.length; index++) {
    var byte = long & 0xff
    byteArray[ index ] = byte
    long = (long - byte) / 256
  }

  return byteArray
}

function SHA256 (msgBytes) {
  let shaObj = new Jssha('SHA-256', 'HEX')
  let msgHex = byteArray2hexStr(msgBytes)
  shaObj.update(msgHex)
  let hashHex = shaObj.getHash('HEX')
  return hexStr2byteArray(hashHex)
}
