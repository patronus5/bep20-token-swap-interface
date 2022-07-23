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
          <div className='w-full min-h-screen bg-primary'></div>
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
