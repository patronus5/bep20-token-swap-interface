import React, { useState, useEffect } from 'react'
import { constants } from 'ethers'
import Web3 from 'web3'

import TokenInput from '../../Components/Swap/TokenInput'
import addresses from '../../Constants/Addresses'

import {
    BNBAddress,
    toBigNumber,
    fromBigNumber
} from '../../Utils/Web3Utils'
import {
    getERC20Contract,
    getMemeRouterContract
} from '../../Utils/ContractHelper'

import tokenList from '../../Constants/Tokenlist.json'

function Swap({
    account,
    isSigned,
    provider,
    displayNotification
}) {
    const divButton = [25, 50, 75, 100]

    const [tokenA, setTokenA] = useState(tokenList.tokens[0])
    const [tokenB, setTokenB] = useState(tokenList.tokens[1])

    const [balanceA, setBalanceA] = useState("0.0");
    const [balanceB, setBalanceB] = useState("0.0")

    const [inputA, setInputA] = useState("")
    const [inputB, setInputB] = useState("")

    const [expectedAmount, setExpectedAmount] = useState("0.0")
    const [typingTimeout, setTypingTimeout] = useState()
    const [approveState, setApproveState] = useState({})
    const [count, setCount] = useState(1)

    const getTokenBalance = async (token) => {
        try {
            let balance = 0
            if (token.address === BNBAddress) {
                let web3 = new Web3(provider)
                balance = await web3.eth.getBalance(account)
            }
            else {
                const tokenContract = getERC20Contract(token.address, provider)
                balance = await tokenContract.methods.balanceOf(account).call()
            }
            balance = fromBigNumber(balance, token.decimals)
            balance = parseFloat(parseFloat(balance).toFixed(5))
            return balance
        } catch {
            return "0.0"
        }
    }

    const swapAB = () => {
        let _tokenA = tokenA
        let _tokenB = tokenB
        setTokenA(_tokenB)
        setTokenB(_tokenA)
        
        let _balanceA = balanceA
        let _balanceB = balanceB
        setBalanceA(_balanceB)
        setBalanceB(_balanceA)

        setInputA("")
        setInputB("")
    }

    const autoInput = (percent) => {
        let value = percent * parseFloat(balanceA) / 100.0
        setInputA(value.toString())
        updateTokenAmount(value.toString(), tokenA, true)
    }

    const isApproved = () => {
        if (tokenA.address !== BNBAddress) {
            return approveState[tokenA.symbol]
        }
        return true
    }

    const isBalanceAvailable = () => {
        if (parseFloat(inputA) > parseFloat(balanceA)) {
            return false
        }
        return true
    }
    
    const onChangeTokenA = async (token) => {
        let balance = await getTokenBalance(token)
        if (token.address === BNBAddress && tokenB.address === BNBAddress) {
            swapAB()
            return
        }
        else if (token.address !== BNBAddress && tokenA.address === BNBAddress) {
            swapAB()
        }
        setTokenA(token)
        setBalanceA(balance.toString())
        // updateTokenAmount(inputA, token, true)
    }

    const onChangeTokenB = async (token) => {
        const balance = await getTokenBalance(token)
        if (token.address === BNBAddress && tokenA.address === BNBAddress) {
            swapAB()
            return
        }
        else if (token.address !== BNBAddress && tokenB.address === BNBAddress) {
            swapAB()
        }
        setTokenB(token)
        setBalanceB(balance.toString())
        // updateTokenAmount(inputB, token, false)
    }

    const onChangeInputA = (value) => {
        if (value.match(/^[0-9]*[.,]?[0-9]*$/)) {
            setInputA(value)
            if (typingTimeout) {
                clearTimeout(typingTimeout)
            }
            setTypingTimeout(
                setTimeout(async () => {
                    await updateTokenAmount(value, tokenA, true)
                }, 500)
            )
        }
    }

    const onChangeInputB = (value) => {
        if (value.match(/^[0-9]*[.,]?[0-9]*$/)) {
            setInputB(value)
            if (typingTimeout) {
                clearTimeout(typingTimeout)
            }
            setTypingTimeout(
                setTimeout(async () => {
                    await updateTokenAmount(value, tokenB, false)
                }, 500)
            )
        }
    }

    const fetchTokenBalance = async () => {
        const _balanceA = await getTokenBalance(tokenA)
        const _balanceB = await getTokenBalance(tokenB)
        setBalanceA(_balanceA.toString())
        setBalanceB(_balanceB.toString())
    }

    const updateTokenAmount = async (value, token, isTokenA) => {
        if (value === "") {
            isTokenA
                ? setInputB("0.0")
                : setInputA("0.0")
            return
        }
        try {
            if (tokenA?.address && tokenB?.address && parseFloat(value) > 0.0) {
                const routerContract = getMemeRouterContract(provider)
                let amount = token.address === BNBAddress
                    ? await routerContract.methods.getTokenAmountOut(
                        tokenB.address,
                        toBigNumber(value, token.decimals)
                    ).call()
                    : await routerContract.methods.getETHAmountOut(
                        token.address,
                        toBigNumber(value, token.decimals)
                    ).call()
                
                isTokenA
                    ? setInputB(fromBigNumber(amount, tokenB.decimals))
                    : setInputA(fromBigNumber(amount, tokenA.decimals))
            }
        } catch(err) {
            console.log(err)
            console.log("Invalid input values", "error")
        }
    }

    const approveTokenA = async () => {
        try {
            const tokenContract = getERC20Contract(tokenA.address, provider)
            tokenContract.methods.approve(
                addresses.routerAddress,
                constants.MaxUint256
            ).send({
                from: account,
                to: tokenA.address,
            })
            .on('transactionHash', () => {
                displayNotification('Transaction submitted', 'info')
            })
            .on('error', (err) => {
                displayNotification(err.message, 'error')
            })
            .then(() => {
                displayNotification('Transaction success', 'success')
                setApproveState({
                    ...approveState,
                    [tokenA.symbol]: true
                })
            })
        } catch (err) {
            console.log(err)
        }
    }

    const swap = async () => {
        try {
            const routerContract = getMemeRouterContract(provider)
            if (tokenA.address === BNBAddress) {
                routerContract.methods.BuyTokens(
                    tokenB.address,
                    "0"
                ).send({
                    from: account,
                    to: addresses.routerAddress,
                    value: toBigNumber(inputA, tokenA.decimals)
                })
                .on('transactionHash', () => {
                    displayNotification('Transaction submitted', 'info')
                })
                .on('error', (err) => {
                    displayNotification(err.message, 'error')
                })
                .then(() => {
                    displayNotification('Transaction success', 'success')
                    setCount(count + 1)
                })
            }
            else {
                routerContract.methods.SellTokens(
                    tokenA.address,
                    toBigNumber(inputA, tokenA.decimals),
                    "0"
                ).send({
                    from: account,
                    to: addresses.routerAddress,
                })
                .on('transactionHash', () => {
                    displayNotification('Transaction submitted', 'info')
                })
                .on('error', (err) => {
                    displayNotification(err.message, 'error')
                })
                .then(() => {
                    displayNotification('Transaction success', 'success')
                    setCount(count + 1)
                })
            }
        } catch (err) {
            displayNotification("Enter an amount", "error")
        }
    }

    useEffect(() => {
        fetchTokenBalance()
    }, [count])

    useEffect(() => {
        if (isSigned) {
            fetchTokenBalance()

            let tokens = {}
            for (let i = 1; i < tokenList.tokens.length; i ++) {
                let item = tokenList.tokens[i]
                tokens = {
                    ...tokens,
                    [item.symbol]: false
                }
            }
            setApproveState(tokens)
        }
    }, [isSigned])

    useEffect(() => {
        if (isSigned) {
            (async () => {
                try {
                    const routerContract = getMemeRouterContract(provider)
                    let amount = tokenA.address === BNBAddress
                        ? await routerContract.methods.getTokenAmountOut(
                            tokenB.address,
                            toBigNumber("1", tokenA.decimals)
                        ).call()
                        : await routerContract.methods.getETHAmountOut(
                            tokenA.address,
                            toBigNumber("1", tokenA.decimals)
                        ).call()
                    setExpectedAmount(fromBigNumber(amount, tokenB.decimals))
                } catch (err) {
                    console.log(err)
                }
            })()
        }
    }, [isSigned, tokenA, tokenB, provider])

    return (
        <section className='relative flex place-content-center w-full'>
            <div className='container flex flex-col justify-center place-items-center py-24'>
                <div className='w-29rem'>
                    <div className='w-full bg-light-gray rounded-2xl px-5 pt-6 pb-8 space-y-3'>
                        <TokenInput
                            token={tokenA}
                            value={inputA}
                            balance={balanceA}
                            onChangeInput={onChangeInputA}
                            onChangeToken={onChangeTokenA}
                        />
                        <div className='w-full flex justify-between'>
                            {divButton.map((value, i) => (
                                <button
                                    className='w-22% bg-light-gray-lighter hover:bg-opacity-80 text-gray-300 font-bold text-center rounded-sm py-0.5'
                                    onClick={() => autoInput(value)}
                                    key={i}
                                >
                                    {value}%
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='relative w-full h-1'>
                        <button
                            className="absolute w-12 h-12 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-light-gray border-4 border-primary rounded-full"
                            onClick={swapAB}
                        >
                            <span className='text-gray-300 hover:text-gray-100 text-xl cursor-pointer'>
                                <i className='fas fa-arrow-down'></i>
                            </span>
                        </button>
                    </div>
                    <div className='w-full bg-light-gray rounded-2xl px-5 pt-6 pb-8'>
                        <TokenInput
                            token={tokenB}
                            value={inputB}
                            balance={balanceB}
                            onChangeInput={onChangeInputB}
                            onChangeToken={onChangeTokenB}
                        />
                    </div>
                    <div className='w-full text-white font-bold text-center py-7'>1 {tokenA.symbol} = {expectedAmount} {tokenB.symbol}</div>
                    {!isSigned &&
                        <button
                            className='w-full bg-yellow hover:bg-opacity-90 text-gray-800 text-xl font-bold tracking-wider rounded-2xl uppercase py-3'
                        >
                            Connect wallet
                        </button>
                    }
                    {(isSigned && !isBalanceAvailable()) &&
                        <div
                            className='w-full bg-light-gray text-gray-300 text-xl text-center font-bold tracking-wider rounded-2xl py-3'
                        >
                            Insufficient balance
                        </div>
                    }
                    {(isSigned && isBalanceAvailable() && !isApproved()) &&
                        <button
                            className='w-full bg-yellow hover:bg-opacity-90 text-gray-800 text-xl font-bold tracking-wider rounded-2xl uppercase py-3'
                            onClick={approveTokenA}
                        >
                            Approve
                        </button>
                    }
                    {(isSigned && isBalanceAvailable() && isApproved()) &&
                        <button
                            className='w-full bg-yellow hover:bg-opacity-90 text-gray-800 text-xl font-bold tracking-wider rounded-2xl uppercase py-3'
                            onClick={swap}
                        >
                            Swap
                        </button>
                    }
                </div>
            </div>
        </section>
    )
}

export default Swap