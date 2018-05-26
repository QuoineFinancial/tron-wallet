import { hexStr2byteArray, longToByteArray } from './address'

export function addRef (transaction, latestBlock) {
  let latestBlockHash = latestBlock.hash
  let latestBlockNum = latestBlock.number
  let numBytes = longToByteArray(latestBlockNum)
  numBytes.reverse()
  let hashBytes = hexStr2byteArray(latestBlockHash)
  let generateBlockId = [...numBytes.slice(0, 8), ...hashBytes.slice(8, hashBytes.length - 1)]
  let rawData = transaction.getRawData()
  rawData.setRefBlockHash(Uint8Array.from(generateBlockId.slice(8, 16)))
  rawData.setRefBlockBytes(Uint8Array.from(numBytes.slice(6, 8)))
  rawData.setExpiration(latestBlock.timestamp + (60 * 5 * 1000))
  transaction.setRawData(rawData)
  return transaction
}
