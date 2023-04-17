import algosdk from "algosdk"
import { Algodv2 } from "algosdk"
import * as dotenv from "dotenv"
import { __dirname } from './helper/dirname.js'
dotenv.config({ path: __dirname + '/.env' })

interface AlgodCredentials {
  token: string,
  url: string,
  port: string
}

class AlgoTools {
  algodClient: Algodv2
  mnemonics: [string]

  constructor(algodCredentials: AlgodCredentials, mnemonics: [string]) {
    this.algodClient = new algosdk.Algodv2(algodCredentials.token, algodCredentials.url, algodCredentials.port)
    this.mnemonics = mnemonics
  }

  public async init() {
    let params = await this.algodClient.getTransactionParams().do()
    console.log(params)
  }

  public async create_accountasync () {
    try {
      let account = algosdk.generateAccount()
      let mn = algosdk.secretKeyToMnemonic(account.sk)
      console.log('Account Mnemonic: ', mn)
      let account_info = await this.algodClient.accountInformation(account.addr)
      console.log(account_info)
    } catch (err) {
      console.error(err)
    }
  }

  public async sendAlgo (sender: string, receiver: string, mn: string, amount: number) {
    const account = algosdk.mnemonicToSecretKey(mn)
    const suggestedParams = await this.algodClient.getTransactionParams().do();
    const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender,
      suggestedParams,
      to: receiver,
      amount: amount,
      note: new Uint8Array(Buffer.from('Transaction from algo tools')),
    });
  
    const signedTxn = ptxn.signTxn(account.sk)
    const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do()
    const result = await algosdk.waitForConfirmation(this.algodClient, txId, 4)
    console.log(result)
    console.log(`Transaction Information: ${result.txn}`)
    console.log(`Decoded Note: ${Buffer.from(result.txn.txn.note).toString()}`)
  }

  public async optInAsa(address: string, mn: string, assetId: number, amount: number, notes?: string) {
    const account = algosdk.mnemonicToSecretKey(mn)
    const params = await this.algodClient.getTransactionParams().do()
    params.fee = 1000
    params.flatFee = true
    const revocationTarget = undefined
    const closeRemainderTo = undefined
    const uint8_note = new Uint8Array(Buffer.from(notes || ''))
  
    const optTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      address,
      address,
      closeRemainderTo,
      revocationTarget,
      amount,
      uint8_note,
      assetId,
      params
    )
  
    const rawSignedTxn = optTxn.signTxn(account.sk)
  }

  public async waitForConfirmation(txId: string) {
    let response = await this.algodClient.status().do()
    let lastround = response['last-round']
    while (true) {
      const pendingInfo = await this.algodClient.pendingTransactionInformation(txId).do()
      if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
        console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
        break;
      }
      lastround++
      await this.algodClient.statusAfterBlock(lastround).do()
    }
  }
  
  // Print created assets
  public async printCreatedAssets(account: string, assetId: number) {
    let accountInfo = await this.algodClient.accountInformation(account).do()
    for (let i = 0; i < accountInfo['created-assets'].length; i++) {
      let scrutinizedAsset = accountInfo['created-assets'][i]
      if (scrutinizedAsset['index'] == assetId) {
        console.log("AssetID = " + scrutinizedAsset['index'])
        let myparms = JSON.stringify(scrutinizedAsset['params'], undefined, 2)
        console.log("parms = " + myparms)
        break
      }
    }
  }
  
  // Print asset holdings
  public async printAssetHolding(account: string, assetId: number) {
    let accountInfo = await this.algodClient.accountInformation(account).do()
    for (let i = 0; i < accountInfo['assets']; i++) {
      let scrutinizedAsset = accountInfo['assets'][i]
      if (scrutinizedAsset['asset-id'] == assetId) {
          let myassetholding = JSON.stringify(scrutinizedAsset, undefined, 2)
          console.log("assetholdinginfo = " + myassetholding)
          break
      }
    }
  }
}


;(async () => {
  // const mn = process.env.WALLET_MAIN!
  // console.log(mn)
  // const sk = algosdk.mnemonicToSecretKey(mn)
  // const address = sk.addr
  // console.log(address)
  // let params = await algodClient.getTransactionParams().do()
  // await create_account()
  const algoTools = new AlgoTools({token: '', url: process.env.ALGO_QUICKNODE!, port: ''}, [process.env.WALLET_MAIN!])
  await algoTools.init()

})().catch((e) => {
  console.error(e)
})
