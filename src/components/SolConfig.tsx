import { Alert, Button, MenuItem, Snackbar, TextField } from "@mui/material"
import React, { useEffect, useState } from "react"
import { getPublicKeyFromPublicKeyString, getPublicKeyFromSecretKeyString } from "../hooks"

export interface SolConfigProps {
    [x: string]: any
}

interface InputProps {
    label: string,
    valueProps: [string, React.Dispatch<string>],
    valueErrorProps: [boolean, React.Dispatch<boolean>],
    required: boolean
}

const NET_MAIN = 'mainnet'
const NET_DEV = 'devnet'
const NET_TEST = 'testnet'
export const network = new Map<string, string>(Array(['selected', NET_MAIN]))
export const keysData = new Map<string, InputProps>()

export const SolConfig = ({
    ...rest
}: SolConfigProps) => {

    const inputDataMap: { [key: string]: InputProps } = {
        gasSecretKey: {
            label: "操作钱包 私钥",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
        },
        gasPublicKey:
        {
            label: "操作钱包 公钥",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
        },
        paySecretKey:
        {
            label: "资产钱包 私钥",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
        },
        payPublicKey:
        {
            label: "资产钱包 公钥",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
        },
        // mintAddress:
        // {
        //     label: "Token地址",
        //     valueProps: useState<string>(""),
        //     valueErrorProps: useState<boolean>(false),
        //     required: true,
        // },
        recevieAddress:
        {
            label: "接收资产钱包 公钥 （选填）",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: false,
        },
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const inputString = event.target.value.trim()
        const error = inputDataMap[event.target.name].valueErrorProps[0]
        const setErrorFunction = inputDataMap[event.target.name].valueErrorProps[1]
        if (inputDataMap[event.target.name].required && inputString.length <= 0 && !error) {
            setErrorFunction(true)
        } else if (error) {
            setErrorFunction(false)
        }
        const setValueFunction = inputDataMap[event.target.name].valueProps[1]
        setValueFunction(inputString)
    }

    const [isSaved, setSaved] = useState<boolean>(false)
    const [showEmptyInput, setShowEmptyInput] = useState<boolean>(false)
    const [showGasKeyMismatch, setShowGasKeyMismatch] = useState<boolean>(false)
    const [showPayKeyMismatch, setShowPayKeyMismatch] = useState<boolean>(false)
    const [showRecevieKeyError, setShowRecevieKeyError] = useState<boolean>(false)

    useEffect(() => {
        saveInput()
    })

    const handleSave = () => {
        for (let key in inputDataMap) {
            keysData.set(key, inputDataMap[key])
        }
        saveInput(true)
    }

    const saveInput = (isClick: boolean = false) => {
        let isCorretInput = keysData.size > 0 ? true : false
        keysData.forEach((element) => {
            const inputString = element.valueProps[0]
            if (element.required && inputString.length <= 0) {
                !element.valueErrorProps[0] && element.valueErrorProps[1](true)
                isCorretInput = false
                isClick && !showEmptyInput && setShowEmptyInput(true)
            }
        })
        if (isCorretInput) {
            showEmptyInput && setShowEmptyInput(false)
            if (
                (getPublicKeyFromSecretKeyString(keysData.get('gasSecretKey')?.valueProps[0]) !==
                    keysData.get('gasPublicKey')?.valueProps[0])
            ) {
                isClick && !keysData.get('gasPublicKey')?.valueErrorProps[0] && keysData.get('gasPublicKey')?.valueErrorProps[1](true)
                isClick && !keysData.get('gasSecretKey')?.valueErrorProps[0] && keysData.get('gasSecretKey')?.valueErrorProps[1](true)
                isClick && !showGasKeyMismatch && setShowGasKeyMismatch(true)
            } else if (
                (getPublicKeyFromSecretKeyString(keysData.get('paySecretKey')?.valueProps[0]) !==
                    keysData.get('payPublicKey')?.valueProps[0])
            ) {
                isClick && !keysData.get('payPublicKey')?.valueErrorProps[0] && keysData.get('payPublicKey')?.valueErrorProps[1](true)
                isClick && !keysData.get('paySecretKey')?.valueErrorProps[0] && keysData.get('paySecretKey')?.valueErrorProps[1](true)
                isClick && !showPayKeyMismatch && setShowPayKeyMismatch(true)
            } else if (
                (getPublicKeyFromPublicKeyString(keysData.get('recevieAddress')?.valueProps[0]) !==
                    keysData.get('recevieAddress')?.valueProps[0])
            ) {
                isClick && !keysData.get('recevieAddress')?.valueErrorProps[0] && keysData.get('recevieAddress')?.valueErrorProps[1](true)
                isClick && !showRecevieKeyError && setShowRecevieKeyError(true)
            } else {
                !keysData.get('gasPublicKey')?.valueErrorProps[0] && keysData.get('gasPublicKey')?.valueErrorProps[1](false)
                keysData.get('gasSecretKey')?.valueErrorProps[0] && keysData.get('gasSecretKey')?.valueErrorProps[1](false)
                keysData.get('payPublicKey')?.valueErrorProps[0] && keysData.get('payPublicKey')?.valueErrorProps[1](false)
                keysData.get('paySecretKey')?.valueErrorProps[0] && keysData.get('paySecretKey')?.valueErrorProps[1](false)
                keysData.get('recevieAddress')?.valueErrorProps[0] && keysData.get('recevieAddress')?.valueErrorProps[1](false)
                showGasKeyMismatch && setShowGasKeyMismatch(false)
                showPayKeyMismatch && setShowPayKeyMismatch(false)
                showRecevieKeyError && setShowRecevieKeyError(false)
                setSaved(true)
            }
        }
    }

    const handleEdit = () => {
        keysData.forEach((element, key) => {
            inputDataMap[key].valueProps[1](element.valueProps[0])
        })
        keysData.clear()
        setSaved(false)
    }

    const handleCloseEmptyInput = (event: React.SyntheticEvent | Event) => {
        showEmptyInput && setShowEmptyInput(false)
    }

    const handleCloseGasKeyMismatch = (event: React.SyntheticEvent | Event) => {
        showGasKeyMismatch && setShowGasKeyMismatch(false)
    }

    const handleClosePayKeyMismatch = (event: React.SyntheticEvent | Event) => {
        showPayKeyMismatch && setShowPayKeyMismatch(false)
    }

    const handleCloseRecevieKeyError = (event: React.SyntheticEvent | Event) => {
        showRecevieKeyError && setShowRecevieKeyError(false)
    }

    const currentNetwork = [
        {
            value: NET_MAIN,
            label: '主网',
        },
        {
            value: NET_DEV,
            label: '开发网',
        },
        {
            value: NET_TEST,
            label: '测试网',
        },
    ];

    const [selectedNetwork, setNetwork] = useState('mainnet');

    const handleNetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        network.set('selected', event.target.value)
        setNetwork(event.target.value)
        console.log(network.get('selected'))
    };

    return (
        <div {...rest}>
            <TextField
                id="outlined-select-currency"
                select
                label="网络"
                value={selectedNetwork}
                onChange={handleNetChange}
                helperText="（支持主网/开发网/测试网）"
            >
                {currentNetwork.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>
            {Object.keys(inputDataMap).map(key => {
                return (
                    <TextField
                        // id={key}
                        key={key}
                        name={key}
                        label={inputDataMap[key].label}
                        color="secondary"
                        error={inputDataMap[key].valueErrorProps[0]}
                        fullWidth={true}
                        value={
                            isSaved && keysData.get(key)?.valueProps[0] ?
                                keysData.get(key)?.valueProps[0] :
                                inputDataMap[key].valueProps[0]
                        }
                        onChange={handleInputChange}
                        required
                        disabled={isSaved}
                    />
                )
            })}
            {isSaved ?
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => handleEdit()}
                >
                    编辑
                </Button>
                :
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => handleSave()}
                >
                    保存
                </Button>
            }
            <Snackbar
                open={showEmptyInput}
                autoHideDuration={2000}
                onClose={handleCloseEmptyInput}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseEmptyInput} severity="error">
                    "请输入必填项"
                </Alert>
            </Snackbar>
            <Snackbar
                open={showGasKeyMismatch}
                autoHideDuration={5000}
                onClose={handleCloseGasKeyMismatch}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseGasKeyMismatch} severity="error">
                    "操作钱包密钥对不匹配"
                </Alert>
            </Snackbar>
            <Snackbar
                open={showPayKeyMismatch}
                autoHideDuration={5000}
                onClose={handleClosePayKeyMismatch}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClosePayKeyMismatch} severity="error">
                    "资产钱包密钥对不匹配"
                </Alert>
            </Snackbar>
            <Snackbar
                open={showRecevieKeyError}
                autoHideDuration={5000}
                onClose={handleCloseRecevieKeyError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseRecevieKeyError} severity="error">
                    "接收资产地址错误"
                </Alert>
            </Snackbar>
        </div>
    )
}