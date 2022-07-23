import React, { Fragment, useEffect } from "react"
import { Dialog, Transition } from '@headlessui/react'
import {
    XIcon,
    QuestionMarkCircleIcon
} from "@heroicons/react/outline"
import tokenList from '../../Constants/Tokenlist.json'

function TokenInfoModal({
    token,
    isOpen,
    closeModal
}) {
    const convertAddresstoName = (addr, a, b) => {
        const len = addr.length
        return addr.slice(0, a) + '...' + addr.slice(len - b, len)
    }

    const convertToPercent = (value) => {
        let percent = parseFloat(value) / 100.0
        return parseFloat(percent.toFixed(3))
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-y-auto"
                onClose={closeModal}
            >
                <div className="min-h-screen px-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0 scale-100"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80" />
                    </Transition.Child>
                    <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="inline-block w-full max-w-26rem overflow-auto text-left align-middle transition-all transform bg-light-gray shadow-xl rounded-xl">
                            <Dialog.Title
                                as="h3"
                                className="flex justify-between text-xl font-bold text-white dark:text-gray-300 py-4 px-6 border-b-[1px] shadow-md"
                            >
                                <div className="flex items-center">
                                    {token.logoURI &&
                                        <img
                                            className="w-8 h-8 rounded-full"
                                            src={token.logoURI}
                                            alt=""
                                        />
                                    }
                                    {!token.logoURI &&
                                        <QuestionMarkCircleIcon className="h-8 inline" />
                                    }
                                    <div className="ml-3 font-semibold text-left">
                                        <h1 className="text-white text-xl">{token.name} ({token.symbol})</h1>
                                    </div>
                                </div>
                                <button>
                                    <XIcon
                                        className="inline h-6 text-gray-300 hover:text-gray-400 outline-none"
                                        onClick={closeModal} />
                                </button>
                            </Dialog.Title>
                            <div className="w-full flex px-6 py-5 space-x-4">
                                <div className="w-full flex flex-col space-y-2">
                                    <div className="w-full flex flex-row justify-between text-white overflow-hidden">
                                        <h1>Address</h1>
                                        <a
                                            href={`${tokenList.scanUrl}${token.address}`}
                                            target="_blank" rel="noopener noreferrer"
                                        >
                                            {convertAddresstoName(token.address, 15, 10)}
                                        </a>
                                    </div>
                                    <div className="w-full flex flex-row justify-between text-white overflow-hidden">
                                        <h1>Router</h1>
                                        <a
                                            href={`${tokenList.scanUrl}${token.Router}`}
                                            target="_blank" rel="noopener noreferrer"
                                        >
                                            {convertAddresstoName(token.Router, 15, 10)}
                                        </a>
                                    </div>
                                    <div className="w-full flex flex-row justify-between text-white overflow-hidden">
                                        <h1>Decimals</h1>
                                        <p>{token.decimals}</p>
                                    </div>
                                    <div className="w-full flex flex-row justify-between text-white overflow-hidden">
                                        <h1>BuyTax</h1>
                                        <p>{convertToPercent(token.BuyTax)}%</p>
                                    </div>
                                    <div className="w-full flex flex-row justify-between text-white overflow-hidden">
                                        <h1>SellTax</h1>
                                        <p>{convertToPercent(token.SellTax)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

export default TokenInfoModal