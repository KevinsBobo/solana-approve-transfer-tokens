import { Alert, Button, Snackbar, TextField } from "@mui/material"
import { Cluster } from "@solana/web3.js"
import React, { useState } from "react"
import { getPublicKeyFromPublicKeyString, getPublicKeyFromSecretKeyString, generateWallte } from "../hooks"
import {
    KeyInputProps,
    gasSecretKey,
    gasPublicKey,
    paySecretKey,
    payPublicKey,
    receviePublicKey,
    NETWORK_MAIN
} from "../Main"

export interface SolConfigProps {
    selectedNetwork: Cluster,
    configSaved: boolean,
    setConfigSaved: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedTokenIndex: React.Dispatch<React.SetStateAction<number>>,
    keysData: { [key: string]: KeyInputProps },
    [x: string]: any
}


export const SolConfig = ({
    selectedNetwork,
    configSaved,
    setConfigSaved,
    setSelectedTokenIndex,
    keysData,
    ...rest
}: SolConfigProps) => {

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const inputString = event.target.value.trim()
        const error = keysData[event.target.name].valueErrorProps[0]
        const setErrorFunction = keysData[event.target.name].valueErrorProps[1]
        if (keysData[event.target.name].required && inputString.length <= 0 && !error) {
            setErrorFunction(true)
        } else if (error) {
            setErrorFunction(false)
        }
        const setValueFunction = keysData[event.target.name].valueProps[1]
        setValueFunction(inputString)
    }

    const [showEmptyInput, setShowEmptyInput] = useState<boolean>(false)
    const [showGasKeyMismatch, setShowGasKeyMismatch] = useState<boolean>(false)
    const [showPayKeyMismatch, setShowPayKeyMismatch] = useState<boolean>(false)
    const [showRecevieKeyError, setShowRecevieKeyError] = useState<boolean>(false)


    const saveInput = () => {
        let isCorretInput = true
        for (let key in keysData) {
            const inputString = keysData[key].valueProps[0]
            if (keysData[key].required && inputString.length <= 0) {
                !keysData[key].valueErrorProps[0] && keysData[key].valueErrorProps[1](true)
                isCorretInput = false
                !showEmptyInput && setShowEmptyInput(true)
            }
        }
        if (isCorretInput) {
            showEmptyInput && setShowEmptyInput(false)
            if (
                (getPublicKeyFromSecretKeyString(keysData[gasSecretKey].valueProps[0]) !==
                    keysData[gasPublicKey].valueProps[0])
            ) {
                !keysData[gasPublicKey].valueErrorProps[0] && keysData[gasPublicKey].valueErrorProps[1](true)
                !keysData[gasSecretKey].valueErrorProps[0] && keysData[gasSecretKey].valueErrorProps[1](true)
                !showGasKeyMismatch && setShowGasKeyMismatch(true)
                isCorretInput = false
            } else {
                keysData[gasPublicKey].valueErrorProps[0] && keysData[gasPublicKey].valueErrorProps[1](false)
                keysData[gasSecretKey].valueErrorProps[0] && keysData[gasSecretKey].valueErrorProps[1](false)
                showGasKeyMismatch && setShowGasKeyMismatch(false)
            }
            if (
                (getPublicKeyFromSecretKeyString(keysData[paySecretKey].valueProps[0]) !==
                    keysData[payPublicKey].valueProps[0])
            ) {
                !keysData[payPublicKey].valueErrorProps[0] && keysData[payPublicKey].valueErrorProps[1](true)
                !keysData[paySecretKey].valueErrorProps[0] && keysData[paySecretKey].valueErrorProps[1](true)
                !showPayKeyMismatch && setShowPayKeyMismatch(true)
                isCorretInput = false
            } else {
                keysData[payPublicKey].valueErrorProps[0] && keysData[payPublicKey].valueErrorProps[1](false)
                keysData[paySecretKey].valueErrorProps[0] && keysData[paySecretKey].valueErrorProps[1](false)
                showPayKeyMismatch && setShowPayKeyMismatch(false)
            }
            if (
                (getPublicKeyFromPublicKeyString(keysData[receviePublicKey].valueProps[0]) !==
                    keysData[receviePublicKey].valueProps[0])
            ) {
                !keysData[receviePublicKey].valueErrorProps[0] && keysData[receviePublicKey].valueErrorProps[1](true)
                !showRecevieKeyError && setShowRecevieKeyError(true)
                isCorretInput = false
            } else {
                keysData[receviePublicKey].valueErrorProps[0] && keysData[receviePublicKey].valueErrorProps[1](false)
                showRecevieKeyError && setShowRecevieKeyError(false)
            }

            if (isCorretInput) {
                for (let key in keysData) {
                    keysData[key].valueErrorProps[0] && keysData[key].valueErrorProps[1](false)
                }
                showGasKeyMismatch && setShowGasKeyMismatch(false)
                showPayKeyMismatch && setShowPayKeyMismatch(false)
                showRecevieKeyError && setShowRecevieKeyError(false)
                setSelectedTokenIndex(1)
                setConfigSaved(true)
            }
        }
    }

    const handleEdit = () => {
        setConfigSaved(false)
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

    const handleGenerate = () => {
        const { secretKeyString: gasSecretKeyString, publicKeyString: gasPublicKeyString } = generateWallte()
        keysData['gasSecretKey'].valueProps[1](gasSecretKeyString)
        keysData['gasPublicKey'].valueProps[1](gasPublicKeyString)

        const { secretKeyString: paySecretKeyString, publicKeyString: payPublicKeyString } = generateWallte()
        keysData['paySecretKey'].valueProps[1](paySecretKeyString)
        keysData['payPublicKey'].valueProps[1](payPublicKeyString)

        const { secretKeyString: recevieSecretKeyString, publicKeyString: receviePublicKeyString } = generateWallte()
        keysData['receviePublicKey'].valueProps[1](receviePublicKeyString)
    }

    return (
        <div {...rest}>
            {Object.keys(keysData).map(key => {
                return (
                    <TextField
                        // id={key}
                        key={key}
                        name={key}
                        label={keysData[key].label}
                        color="secondary"
                        error={keysData[key].valueErrorProps[0]}
                        // fullWidth={true}
                        value={keysData[key].valueProps[0]}
                        onChange={handleInputChange}
                        required={keysData[key].required}
                        disabled={configSaved}
                        type={selectedNetwork !== NETWORK_MAIN ? "text" : keysData[key].type}
                        style={{ width: '100%', maxWidth: 600 }}
                    />
                )
            })}
            <div style={{ display: "flex" }}>
                {selectedNetwork !== NETWORK_MAIN ?
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => handleGenerate()}
                        style={{ marginRight: 20 }}
                        disabled={configSaved}
                    >
                        生成测试钱包
                    </Button>
                    :
                    <></>
                }
                {configSaved ?
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
                        onClick={() => saveInput()}
                    >
                        保存
                    </Button>
                }
            </div>
            <Snackbar
                open={showEmptyInput}
                autoHideDuration={2000}
                onClose={handleCloseEmptyInput}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseEmptyInput} severity="error">
                    请输入必填项
                </Alert>
            </Snackbar>
            <Snackbar
                open={showGasKeyMismatch}
                autoHideDuration={5000}
                onClose={handleCloseGasKeyMismatch}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseGasKeyMismatch} severity="error">
                    操作钱包密钥对不匹配
                </Alert>
            </Snackbar>
            <Snackbar
                open={showPayKeyMismatch}
                autoHideDuration={5000}
                onClose={handleClosePayKeyMismatch}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClosePayKeyMismatch} severity="error">
                    资产钱包密钥对不匹配
                </Alert>
            </Snackbar>
            <Snackbar
                open={showRecevieKeyError}
                autoHideDuration={5000}
                onClose={handleCloseRecevieKeyError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseRecevieKeyError} severity="error">
                    接收资产地址错误
                </Alert>
            </Snackbar>
        </div>
    )
}