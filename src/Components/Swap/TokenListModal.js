import React, { Fragment } from "react"
import { Dialog, Transition } from '@headlessui/react'
import {
    XIcon,
    QuestionMarkCircleIcon
} from "@heroicons/react/outline"

import tokenList from '../../Constants/Tokenlist.json'

function TokenListModal({
    isOpen,
    closeModal,
    onChangeToken
}) {
    const onClickItem = (token) => {
        closeModal()
        onChangeToken(token)
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
                        <div className="inline-block w-full max-w-26rem overflow-auto text-left align-middle transition-all transform bg-light-gray shadow-xl rounded-2xl">
                            <Dialog.Title
                                as="h3"
                                className="flex justify-between text-xl font-bold text-white dark:text-gray-300 py-4 px-6 border-b-[1px] shadow-md"
                            >
                                Select a Token
                                <button>
                                    <XIcon
                                        className="inline h-6 text-gray-300 hover:text-gray-400"
                                        onClick={closeModal} />
                                </button>
                            </Dialog.Title>
                            <div className="relative w-full border-b border-gray-600 px-6 pt-5 pb-2">
                                <div className="relative w-full">
                                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                        <svg
                                            aria-hidden="true"
                                            className="w-5 h-5 text-gray-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                clipRule="evenodd">
                                            </path>
                                        </svg>
                                    </div>
                                    <input
                                        className="bg-primary border border-gray-500 text-white text-sm rounded-lg block w-full pl-10 p-2.5"
                                        type="text" placeholder="Enter the token symbol or address" required />
                                </div>
                            </div>
                            <div className="mt-4 overflow-y-auto max-h-96">
                                {tokenList.tokens.map((token, index) => (
                                    <button
                                        key={index}
                                        className="w-full flex justify-between items-center bg-white bg-opacity-0 px-8 py-4 first:pt-2 last:pb-2 hover:bg-opacity-5 hover:rounded-md"
                                        onClick={() => onClickItem(token)}
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
                                                <h1 className="text-white text-xl">{token.symbol}</h1>
                                                <p className="text-left text-gray-400 text-sm">{token.name}</p>
                                            </div>
                                        </div>
                                        {/* <p className="">0</p> */}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

export default TokenListModal