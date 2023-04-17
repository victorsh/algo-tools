import algosdk from "algosdk"
import * as dotenv from "dotenv"
import { __dirname } from './helper/dirname.js'

dotenv.config({ path: __dirname + '/.env' })

const algodClient = new algosdk.Algodv2('', process.env.ALGO_QUICKNODE!, '')

;(async () => {
  const mn = process.env.WALLET_MAIN!
  console.log(mn)
  const sk = algosdk.mnemonicToSecretKey(mn)
  const address = sk.addr
  console.log(address)
  let params = await algodClient.getTransactionParams().do()
  console.log(params)
})().catch((e) => {
  console.error(e)
});
