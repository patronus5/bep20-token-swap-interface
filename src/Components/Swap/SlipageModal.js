import React, { Fragment } from "react"
import { Dialog, Transition } from '@headlessui/react'
import {
    XIcon,
} from "@heroicons/react/outline"
import classnames from 'classnames'

function SlipageModal({
    isOpen,
    slipage,
    isDefault,
    closeModal,
    onChangeSlipage
}) {
    const classes = classnames (
        'bg-yellow text-gray-800 font-medium rounded-2xl px-5 py-1.5 box-border',
        {
            'bg-primary border-2 border-yellow text-yellow': !isDefault
        }
    )
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
                                Slippage Tolerance
                                <button>
                                    <XIcon
                                        className="inline h-6 text-gray-300 hover:text-gray-400"
                                        onClick={closeModal} />
                                </button>
                            </Dialog.Title>
                            <div className="w-full flex flex-col px-6 py-7 space-y-4">
                                <div className="w-full flex space-x-4">
                                    <button
                                        className={classes}
                                        onClick={(e) => onChangeSlipage(e.target.value, true)}>1.0%</button>
                                    <input
                                        className="sm:flex-grow w-full bg-primary border border-gray-500 text-white text-sm font-medium rounded-lg block outline-none sm:pl-3 sm:pr-6 px-3"
                                        onChange={(e) => onChangeSlipage(e.target.value, false)}
                                        type="text" value={isDefault?'':slipage} placeholder="3" required />
                                </div>
                                { parseFloat(slipage) >= 5.0 &&
                                    <div className="bg-light-gray-lighter text-center py-3 rounded-xl">
                                        <h1 className="text-red-500 items-center">
                                            <span className='text-xl cursor-pointer px-2'>
                                                <i className='fas fa-exclamation-triangle'></i>
                                            </span>
                                            Slippage Warning {slipage} %
                                        </h1>
                                        <p className="text-gray-300">Your transaction may be frontrun</p>
                                    </div>
                                }
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

export default SlipageModal