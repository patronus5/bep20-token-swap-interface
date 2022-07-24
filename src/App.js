import React from 'react'
import Web3 from 'web3'
import Web3Modal from "web3modal"
import { providers } from "ethers"
import { ToastContainer, toast } from 'react-toastify'
import WalletConnectProvider from "@walletconnect/web3-provider"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import tokenList from './Constants/Tokenlist.json'
import Swap from './Pages/Swap/Swap'
import Header from './Layouts/Header'
import {
  getERC20Contract,
  getMemeRouterContract
} from './Utils/ContractHelper'

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

const infuralURL = 'https://bsc-dataseed1.binance.org'

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "e1ca38f0c58f4681bf723d6ebb6da5d2",
    }
  }
}

let web3, web3Modal
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
    theme: "dark",
  });
}

class Container extends React.Component {

  constructor() {
    super()

    this.state = {
      address: '',
      tokens: [],
      provider: null,
      isSigned: false,
      loading: true,
      web3Provider: null
    }
  }

  connectWallet = async () => {
    if(this.state.isSigned === true) return

    const provider = await web3Modal.connect();
    const web3Provider = new providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    const account = await signer.getAddress()

    web3 = new Web3(provider)

    if(await web3.eth.getChainId() !== 56) {
      await web3Provider.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }]
      });
    }

    this.setState({
      address: account,
      isSigned: true,
      provider,
      web3Provider
    }, () => {
      this.state.provider.on("accountsChanged", this.handleAccountsChanged)
      this.state.provider.on("chainChanged", this.handleChainChanged)
    })
  }

  disconnectWallet = async () => {
    await web3Modal.clearCachedProvider();
    window.location.reload()
  }

  loadTokensInfo = async () => {
    let provider = new Web3.providers.HttpProvider(infuralURL)
    const routerContract = getMemeRouterContract(provider)
    let tokens = []
    let flag = new Map()
    for (let i = 0; i < tokenList.tokens.length; i ++) {
      let item = tokenList.tokens[i]
      if (i > 0) {
        let info = await routerContract.methods.ListedTokens(item.address).call()
        tokens.push({
          ...item,
          Router: info.Router,
          BuyTax: info.BuyTax,
          SellTax: info.SellTax
        })
      }
      else {
        tokens.push({
          ...item
        })
      }
      flag.set(item.address, true)
    }

    let id = 0;
    while (1) {
      try {
        let tokenAddress = await routerContract.methods.allTokens(id).call()
        if (!flag.get(tokenAddress)) {
          let info = await routerContract.methods.ListedTokens(tokenAddress).call()
          const tokenContract = getERC20Contract(tokenAddress, provider)
          let name = await tokenContract.methods.name().call()
          let symbol = await tokenContract.methods.symbol().call()
          let decimals = await tokenContract.methods.decimals().call()
          tokens.push({
            name,
            symbol,
            decimals,
            address: tokenAddress,
            logoURI: "",
            Router: info.Router,
            BuyTax: info.BuyTax,
            SellTax: info.SellTax
          })
        }

        id ++
      } catch (e) {
        console.log(e.message)
        break;
      }
    }
    this.setState({
      ...this.state.address,
      tokens: tokens,
      loading: false
    })
  }

  displayNotification = (text, appearance) => {
    let options = {
      autoClose: 2000,
      pauseOnHover: true
    }
    switch(appearance) {
        case 'warning':
            toast.warn(text, options); break
        case 'info':
            toast.info(text, options); break
        case 'error':
            toast.error(text, options); break
        case 'success':
            toast.success(text, options); break
        default:
            break
    }
  }

  handleChainChanged = () => {
    window.location.reload()
  }

  handleAccountsChanged = () => {
    window.location.reload()
  }

  componentDidMount() {
    if(web3Modal.cachedProvider) {
      this.connectWallet()
    }
    if(this.state.loading) {
      (async () => {
        this.loadTokensInfo()
      })()
    }

    return () => {
      if (this.state.provider.removeListener) {
        this.state.provider.removeListener("accountsChanged", this.handleAccountsChanged)
        this.state.provider.removeListener("chainChanged", this.handleChainChanged)
      }
    }
  }

  render() {
    return (
      <section className="relative">
        <ToastContainer />
        {!this.state.loading &&
          <div className='w-full'>
            <div className='w-full border-b border-light-gray'>
              <Header
                address={this.state.address}
                isSigned={this.state.isSigned}
                connectWallet={this.connectWallet}
                disconnectWallet={this.disconnectWallet} />
            </div>
            <Routes>
              <Route
                path="/"
                element={
                  <Swap
                    tokens={this.state.tokens}
                    account={this.state.address}
                    isSigned={this.state.isSigned}
                    provider={this.state.provider}
                    connectWallet={this.connectWallet}
                    displayNotification={this.displayNotification} />
                }/>
            </Routes>
          </div>
        }
        {this.state.loading &&
          <div className='flex flex-col justify-center place-items-center w-full min-h-screen bg-primary'>
            <button disabled type="button" class="py-2.5 px-7 mr-2 text-2xl font-medium bg-primary text-gray-300 rounded-lg inline-flex items-center">
              <svg role="status" class="inline mr-4 w-6 h-6 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
              </svg>
              Loading...
          </button>
          </div>
        }
      </section>
    )
  }
}

function App() {
  return (
    <BrowserRouter>
      <Container />
    </BrowserRouter>
  );
}

export default App;
