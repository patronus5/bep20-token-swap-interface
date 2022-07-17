import React, { useState } from "react"
import TokenListModal from '../../Components/Swap/TokenListModal'
import {
    QuestionMarkCircleIcon
} from "@heroicons/react/outline"

function TokenInput({
    token,
    value,
    balance,
    onChangeInput,
    onChangeToken
}) {
    const [isOpen, setIsOpen] = useState(false)

    const openModal = () => {
        setIsOpen(true)
    }

    const closeModal = () => {
        setIsOpen(false)
    }

    return (
        <div className="flex flex-col place-items-center w-full space-y-2">
            <TokenListModal
                isOpen={isOpen}
                closeModal={closeModal}
                onChangeToken={onChangeToken}
            />
            <div className="flex flex-row justify-between place-items-center w-full">
                <button
                    className="flex items-center bg-white bg-opacity-0 hover:bg-opacity-10 text-white text-xl font-bold rounded-md px-2 py-1"
                    onClick={openModal}
                >
                    {token.logoURI &&
                        <img
                            className="w-6 h-6 rounded-full"
                            src={token.logoURI}
                            alt=""
                        />
                    }
                    {!token.logoURI &&
                        <QuestionMarkCircleIcon className="h-5 inline" />
                    }
                    <span className="px-2">{token.symbol}</span>
                    <span>
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 18 18"
                            fill="none" xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M6.58398 12.376C6.78189 12.6728 7.21811 12.6728 7.41603 12.376L10.4818 7.77735C10.7033 7.44507 10.4651 7 10.0657 7H3.93426C3.53491 7 3.29672 7.44507 3.51823 7.77735L6.58398 12.376Z"
                                fill="currentColor">
                            </path>
                        </svg>
                    </span>
                </button>
                <div className="text-gray-300 font-bold"><span>Balance: {balance}</span></div>
            </div>
            <input
                className="w-full bg-transparent text-white text-4xl font-medium px-2 py-2 placeholder-gray-500 outline-none focus:outline-none"
                value={value}
                onChange={(e) => onChangeInput(e.target.value)}
                placeholder="0.00" />
        </div>
    )
}

export default TokenInput