import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Input, TextField } from "@mui/material"
import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js"
import React, { useEffect } from "react"
import { useState } from "react"
import {
    getMintDecimals,
    getMintAccountInfo,
    approveTokens,
    transferTokens
} from "../hooks"

const logArray = Array<string>()

export interface SolActionProps {
    selectedNetwork: Cluster,
    gasSecretKeyString: string,
    gasPublicKeyString: string,
    paySecretKeyString: string,
    payPublicKeyString: string,
    receviePublicKeyString: string,
    isConfirmed: boolean,
    setConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
    [x: string]: any
}

export const SolAction = ({
    selectedNetwork,
    gasSecretKeyString,
    gasPublicKeyString,
    paySecretKeyString,
    payPublicKeyString,
    receviePublicKeyString,
    isConfirmed,
    setConfirmed,
    ...rest
}: SolActionProps) => {
    let decimals = -1;

    const connection = new Connection(clusterApiUrl(selectedNetwork), 'confirmed')

    const handleCancel = () => {
        setSubmited(false)
    }

    async function getGasMintAccountInfo() {
        const gasMintAccountInfo = await getMintAccountInfo(connection, mintAddress, gasPublicKeyString)
        const gasAmount = gasMintAccountInfo?.amount ?
            Number(gasMintAccountInfo.amount) / 10 ** (mintDecimals >= 0 ? mintDecimals : (decimals >= 0 ? decimals : 0)) :
            0
        setGasMintAmount(gasAmount)
        return gasAmount
    }

    async function getRecevieMintAccountInfo() {
        const recevieMintAccountInfo = await getMintAccountInfo(connection, mintAddress, receviePublicKeyString)
        const recevieAmount = recevieMintAccountInfo?.amount ?
            Number(recevieMintAccountInfo.amount) / 10 ** (mintDecimals >= 0 ? mintDecimals : (decimals >= 0 ? decimals : 0)) :
            0
        setRecevieMintAmount(recevieAmount)
        return recevieAmount
    }

    async function getPayMintAccountInfo() {
        const payMintAccountInfo = await getMintAccountInfo(connection, mintAddress, payPublicKeyString)
        const payAmount = payMintAccountInfo?.amount ?
            Number(payMintAccountInfo.amount) / 10 ** (mintDecimals >= 0 ? mintDecimals : (decimals >= 0 ? decimals : 0)) :
            0
        const payMintGelegatedAmount = payMintAccountInfo?.delegatedAmount ?
            Number(payMintAccountInfo.amount) / 10 ** (mintDecimals >= 0 ? mintDecimals : (decimals >= 0 ? decimals : 0)) :
            0
        const payMintGelegate = payMintAccountInfo?.delegate?.toBase58()
        setPayMintAmount(payAmount)
        setPayMintApproveAddress(payMintGelegate)
        // setPayMintApproveAmount(payMintGelegatedAmount)
        return { payAmount, payMintGelegate, payMintGelegatedAmount }
    }

    async function getAllMintAccountInfo(isAuto: boolean = false) {
        // ???????????????????????????
        if (!isAuto || isGasToPay) {
            const gasAmount = await getGasMintAccountInfo()
            if (!isAuto || gasAmount !== gasMintAmount) {
                // console.log(`??????????????????: ${gasAmount}`)
                logArray.push(`??????????????????: ${gasAmount}`)
                setLogString(logArray.join('\n'))
            }
        }
        if (!isAuto) {
            const recevieAmount = await getRecevieMintAccountInfo()
            if (!isAuto && recevieAmount !== recevieMintAmount) {
                // console.log(`??????????????????: ${recevieAmount}`)
                logArray.push(`??????????????????: ${recevieAmount}`)
                setLogString(logArray.join('\n'))
            }
        }

        const { payAmount, payMintGelegate, payMintGelegatedAmount } = await getPayMintAccountInfo()
        if (!isAuto || payAmount !== payMintAmount) {
            // console.log(`??????????????????: ${payAmount}`)
            logArray.push(`??????????????????: ${payAmount}`)
            setLogString(logArray.join('\n'))
        }
        if (!isAuto || payMintGelegate !== payMintApproveAddress) {
            // console.log(`????????????: ${payMintGelegate}`)
            logArray.push(`????????????: ${payMintGelegate}`)
            setLogString(logArray.join('\n'))
        }
        // if (!isAuto || payMintGelegatedAmount !== payMintApproveAmount) {
        //     // console.log(`????????????: ${payMintGelegatedAmount}`)
        //     logArray.push(`????????????: ${payMintGelegatedAmount}`)
        //     setLogString(logArray.join('\n'))
        // }
    }

    async function handleConfirm() {
        if (!mintAmount || mintAmount <= 0) {
            setEmptyInput(true)
            return
        }
        setConfirming(true)
        decimals = await getMintDecimals(connection, mintAddress)
        if (decimals >= 0) {
            setMintDecimals(decimals)
            await getAllMintAccountInfo()
            !isConfirmed && setConfirmed(true)
            // ????????????
            setTimeout(autoTimer, 1000)
        } else {
            // console.log("Token????????????")
            logArray.push("Token????????????")
            setLogString(logArray.join('\n'))
        }
        setConfirming(false)
    }

    const handleEdit = () => {
        isConfirmed && setConfirmed(false)
        isGasToPay && setGasToPay(false)
        isPayToRecevie && setPayToRecevie(false)
    }

    const handleMintAddressChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setMintAddress(event.target.value)
    }

    const handleMintAMountChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setMintAmount(parseFloat(event.target.value))
        setEmptyInput(false)
    }

    function checkBalanceEnough(isCheckedGasToPay: boolean, isCheckedPayToRecevie: boolean) {
        if (!isCheckedGasToPay && !isCheckedPayToRecevie) {
            !isAmountEnough && setAmountEnough(true)
        } else if (isCheckedGasToPay) {
            if (mintAmount && gasMintAmount >= mintAmount) {
                !isAmountEnough && setAmountEnough(true)
            } else {
                isAmountEnough && setAmountEnough(false)
            }
        } else if (isCheckedPayToRecevie && mintAmount && payMintAmount >= mintAmount) {
            !isAmountEnough && setAmountEnough(true)
        } else {
            isAmountEnough && setAmountEnough(false)
        }
    }

    async function handleExecution() {
        setSubmited(true)
        await execution()
        setSubmited(false)
    }

    const handleAutoExecution = () => {
        setAutoSubmited(true)
    }

    async function execution(isAuto: boolean = false) {
        if (isGasToPay) {
            try {
                if (isAuto) {
                    const gasAmount = await getGasMintAccountInfo()
                    if (mintAmount && gasAmount < mintAmount) {
                        // console.log('gasAmount not enough!')
                        if (!isAuto) {
                            logArray.push(`???????????? ${gasPublicKeyString.slice(0, 4)}...${gasPublicKeyString.slice(-3)} Token????????????`)
                            setLogString(logArray.join('\n'))
                        }
                        return
                    }
                }
                // transfer
                setInExecution(true)
                if (mintAmount) {
                    // console.log('transfer GasToPay')
                    logArray.push(`?????????????????? (??????????????????????????? ${gasPublicKeyString.slice(0, 4)}...${gasPublicKeyString.slice(-3)} -> ${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)})`)
                    setLogString(logArray.join('\n'))
                    let signature = await transferTokens(
                        connection,
                        mintAddress,
                        gasSecretKeyString,
                        gasPublicKeyString,
                        payPublicKeyString,
                        mintAmount * 10 ** (mintDecimals >= 0 ? mintDecimals : (decimals >= 0 ? decimals : 0))
                    )
                    // console.log('transfer success')
                    logArray.push(`????????????: ${signature}`)
                    setLogString(logArray.join('\n'))
                    setGasToPay(false)
                }
            } catch (error) {
                if (error instanceof Error) {
                    logArray.push(`??????: ${error.name}`)
                    setLogString(logArray.join('\n'))
                }
                console.log(error)
                return
            } finally {
                setInExecution(false)
            }
        }
        if (isPayToRecevie) {
            try {
                if (mintAmount) {
                    const { payAmount, payMintGelegate, payMintGelegatedAmount } = await getPayMintAccountInfo()
                    if (payAmount < mintAmount) {
                        // console.log('payAmount not enough!')
                        if (!isAuto) {
                            logArray.push(`???????????? ${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)} Token????????????`)
                            setLogString(logArray.join('\n'))
                        }
                        return
                    }
                    if (gasPublicKeyString !== payPublicKeyString && (payMintGelegate !== gasPublicKeyString || (payMintGelegatedAmount < mintAmount))) {
                        // approve
                        // console.log('approve')
                        logArray.push('??????????????????')
                        setLogString(logArray.join('\n'))
                        await approveTokens(
                            connection,
                            mintAddress,
                            gasSecretKeyString,
                            paySecretKeyString
                        )
                        // console.log('approve success')
                        logArray.push('????????????')
                        setLogString(logArray.join('\n'))
                    }
                }
                // transfer
                setInExecution(true)
                if (mintAmount) {
                    // console.log('transfer PayToRecevie')
                    logArray.push(`?????????????????? (??????????????????????????? ${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)} -> ${receviePublicKeyString.slice(0, 4)}...${receviePublicKeyString.slice(-3)})`)
                    setLogString(logArray.join('\n'))
                    let signature = await transferTokens(
                        connection,
                        mintAddress,
                        gasSecretKeyString,
                        payPublicKeyString,
                        receviePublicKeyString,
                        mintAmount * 10 ** (mintDecimals >= 0 ? mintDecimals : (decimals >= 0 ? decimals : 0))
                    )
                    logArray.push(`????????????: ${signature}`)
                    setLogString(logArray.join('\n'))
                    // console.log('transfer success')
                }
                setPayToRecevie(false)
                isAutoSubmited && setAutoSubmited(false)
                await getAllMintAccountInfo()
            } catch (error) {
                if (error instanceof Error) {
                    logArray.push(`??????: ${error.name}`)
                    setLogString(logArray.join('\n'))
                }
                console.log(error)
                return
            } finally {
                setInExecution(false)
            }
        }
    }

    function handleGasToPayChecked(event: React.SyntheticEvent<Element, Event>, checked: boolean) {
        // ????????????
        checkBalanceEnough(checked, isPayToRecevie)
        setGasToPay(checked)
    }

    function handlePayToRecevieChecked(event: React.SyntheticEvent<Element, Event>, checked: boolean) {
        checkBalanceEnough(isGasToPay, checked)
        setPayToRecevie(checked)
    }

    function autoTimer() {
        setTimerStart(true)
    }

    useEffect(() => {
        const timerHandler = async () => {
            if (isTimerStart && isConfirmed) {
                setTimerStart(false)
                if (isAutoSubmited && !inExecution) {
                    execution(true)
                } else if (!isSubmited) {
                    // console.log('refresh')
                    getAllMintAccountInfo(true)
                    checkBalanceEnough(isGasToPay, isPayToRecevie)
                }
                // ????????????
                setTimeout(autoTimer, 1000)
            } else if (isTimerStart) {
                setTimerStart(false)
            }
        }

        timerHandler().catch(console.error)
    })

    const [mintAddress, setMintAddress] = useState<string>("")
    const [mintAmount, setMintAmount] = useState<number>()
    const [mintDecimals, setMintDecimals] = useState<number>(-1)
    const [gasMintAmount, setGasMintAmount] = useState<number>(0)
    const [payMintAmount, setPayMintAmount] = useState<number>(0)
    const [recevieMintAmount, setRecevieMintAmount] = useState<number>(0)
    // const [payMintApproveAmount, setPayMintApproveAmount] = useState<number>(0)
    const [payMintApproveAddress, setPayMintApproveAddress] = useState<string | undefined>()

    const [isConfirming, setConfirming] = useState(false)
    const [isTimerStart, setTimerStart] = useState(false)
    const [isSubmited, setSubmited] = useState(false)
    const [isAutoSubmited, setAutoSubmited] = useState(false)
    const [inExecution, setInExecution] = useState(false)

    const [isAmountEnough, setAmountEnough] = useState(true)
    const [isGasToPay, setGasToPay] = useState(false)
    const [isPayToRecevie, setPayToRecevie] = useState(false)
    const [isEmptyInput, setEmptyInput] = useState(false)

    const [logString, setLogString] = useState("?????????????????????Token?????????????????????")

    return (
        <div {...rest}>
            <Input
                placeholder="Token?????? *"
                color="secondary"
                // error={}
                value={mintAddress}
                onChange={handleMintAddressChange}
                disabled={isConfirmed}
                style={{ width: 400 }}
            />
            <div style={{ display: "flex" }}>
                <Input
                    key="maitAddress"
                    color="secondary"
                    placeholder="?????? *"
                    // error={}
                    value={mintAmount}
                    onChange={handleMintAMountChange}
                    disabled={isConfirmed}
                    style={{ width: 200, marginRight: 20 }}
                    type="number"
                    error={isEmptyInput}
                />
                {isConfirmed ?
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => handleEdit()}
                        disabled={isSubmited}
                    >
                        ??????
                    </Button>
                    :
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => handleConfirm()}
                        disabled={isConfirming}
                    >
                        {isConfirming ? <CircularProgress size={26} /> : "??????"}
                    </Button>
                }
            </div>
            <FormGroup>
                {(gasPublicKeyString !== receviePublicKeyString && gasPublicKeyString !== payPublicKeyString) ?
                    <FormControlLabel
                        control={<Checkbox checked={isGasToPay} />}
                        disabled={isSubmited || isAutoSubmited || !isConfirmed}
                        onChange={handleGasToPayChecked}
                        label={`???????????????(${gasPublicKeyString.slice(0, 4)}...${gasPublicKeyString.slice(-3)})??????(${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)})`} />
                    :
                    <></>
                }
                <FormControlLabel
                    control={<Checkbox checked={isPayToRecevie} />}
                    disabled={isSubmited || isAutoSubmited || !isConfirmed}
                    onChange={handlePayToRecevieChecked}
                    label={`???(${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)})??????????????????(${receviePublicKeyString.slice(0, 4)}...${receviePublicKeyString.slice(-3)})`} />
            </FormGroup>
            {
                isAutoSubmited || isSubmited ?
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => handleCancel()}
                        disabled={inExecution}
                    >
                        {inExecution ? <CircularProgress size={26} /> : "????????????"}
                    </Button>
                    :
                    (
                        isAmountEnough ?
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={() => handleExecution()}
                                disabled={!isConfirmed}
                            >
                                ???????????????????????????
                            </Button>
                            :
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={() => handleAutoExecution()}
                                disabled={!isConfirmed}
                            >
                                ???????????????????????????
                            </Button>
                    )
            }
            <TextField
                id="standard-multiline-static"
                label="????????????"
                multiline
                rows={10}
                variant="filled"
                value={logString}
                style={{ width: '100%', maxWidth: 600 }}
            />
        </div >
    )
}