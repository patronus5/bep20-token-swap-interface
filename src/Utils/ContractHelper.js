import Web3 from 'web3'

import addresses from '../Constants/Addresses'

import Erc20ABI from '../Constants/ABI/Erc20.json'
import MemeSwapRouterABI from '../Constants/ABI/MemeSwapRouter.json'

export const getERC20Contract = (_addr, provider) => {
    let web3 = new Web3(provider)
    let contract = new web3.eth.Contract(Erc20ABI, _addr)
    return contract
}

export const getMemeRouterContract = (provider) => {
    let web3 = new Web3(provider)
    let contract = new web3.eth.Contract(MemeSwapRouterABI, addresses.routerAddress)
    return contract
}
