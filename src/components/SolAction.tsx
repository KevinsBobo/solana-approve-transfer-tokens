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

    const connection = new Connection(clusterApiUrl(selectedNetwork), 'confirmed')

    const handleCancel = () => {
        setSubmited(false)
    }

    async function getGasMintAccountInfo() {
        const gasMintAccountInfo = await getMintAccountInfo(connection, mintAddress, gasPublicKeyString)
        const gasAmount = gasMintAccountInfo?.amount ?
            Number(gasMintAccountInfo.amount) / 10 ** mintDecimals :
            0
        setGasMintAmount(gasAmount)
        return gasAmount
    }

    async function getRecevieMintAccountInfo() {
        const recevieMintAccountInfo = await getMintAccountInfo(connection, mintAddress, receviePublicKeyString)
        const recevieAmount = recevieMintAccountInfo?.amount ?
            Number(recevieMintAccountInfo.amount) / 10 ** mintDecimals :
            0
        setRecevieMintAmount(recevieAmount)
        return recevieAmount
    }

    async function getPayMintAccountInfo() {
        const payMintAccountInfo = await getMintAccountInfo(connection, mintAddress, payPublicKeyString)
        const payAmount = payMintAccountInfo?.amount ?
            Number(payMintAccountInfo.amount) / 10 ** mintDecimals :
            0
        const payMintGelegatedAmount = payMintAccountInfo?.delegatedAmount ?
            Number(payMintAccountInfo.amount) / 10 ** mintDecimals :
            0
        const payMintGelegate = payMintAccountInfo?.delegate?.toBase58()
        setPayMintAmount(payAmount)
        setPayMintApproveAddress(payMintGelegate)
        // setPayMintApproveAmount(payMintGelegatedAmount)
        return { payAmount, payMintGelegate, payMintGelegatedAmount }
    }

    async function getAllMintAccountInfo(isAuto: boolean = false) {
        // 获取余额、授权信息
        if (!isAuto || isGasToPay) {
            const gasAmount = await getGasMintAccountInfo()
            if (!isAuto || gasAmount !== gasMintAmount) {
                // console.log(`操作钱包余额: ${gasAmount}`)
                logArray.push(`操作钱包余额: ${gasAmount}`)
                setLogString(logArray.join('\n'))
            }
        }
        if (!isAuto) {
            const recevieAmount = await getRecevieMintAccountInfo()
            if (!isAuto && recevieAmount !== recevieMintAmount) {
                // console.log(`接收地址余额: ${recevieAmount}`)
                logArray.push(`接收地址余额: ${recevieAmount}`)
                setLogString(logArray.join('\n'))
            }
        }

        const { payAmount, payMintGelegate, payMintGelegatedAmount } = await getPayMintAccountInfo()
        if (!isAuto || payAmount !== payMintAmount) {
            // console.log(`资产钱包余额: ${payAmount}`)
            logArray.push(`资产钱包余额: ${payAmount}`)
            setLogString(logArray.join('\n'))
        }
        if (!isAuto || payMintGelegate !== payMintApproveAddress) {
            // console.log(`授权地址: ${payMintGelegate}`)
            logArray.push(`授权地址: ${payMintGelegate}`)
            setLogString(logArray.join('\n'))
        }
        // if (!isAuto || payMintGelegatedAmount !== payMintApproveAmount) {
        //     // console.log(`授权数量: ${payMintGelegatedAmount}`)
        //     logArray.push(`授权数量: ${payMintGelegatedAmount}`)
        //     setLogString(logArray.join('\n'))
        // }
    }

    async function handleConfirm() {
        if (!mintAmount || mintAmount <= 0) {
            setEmptyInput(true)
            return
        }
        setConfirming(true)
        const declimals = await getMintDecimals(connection, mintAddress)
        if (declimals >= 0) {
            setMintDecimals(declimals)
            await getAllMintAccountInfo()
            !isConfirmed && setConfirmed(true)
            // 定时任务
            setTimeout(autoTimer, 1000)
        } else {
            // console.log("Token地址错误")
            logArray.push("Token地址错误")
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
                            logArray.push(`操作钱包 ${gasPublicKeyString.slice(0, 4)}...${gasPublicKeyString.slice(-3)} Token余额不足`)
                            setLogString(logArray.join('\n'))
                        }
                        return
                    }
                }
                // transfer
                setInExecution(true)
                if (mintAmount) {
                    // console.log('transfer GasToPay')
                    logArray.push(`开始发送交易 (操作钱包到资产钱包 ${gasPublicKeyString.slice(0, 4)}...${gasPublicKeyString.slice(-3)} -> ${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)})`)
                    setLogString(logArray.join('\n'))
                    let signature = await transferTokens(
                        connection,
                        mintAddress,
                        gasSecretKeyString,
                        gasPublicKeyString,
                        payPublicKeyString,
                        mintAmount * 10 ** 9
                    )
                    // console.log('transfer success')
                    logArray.push(`交易完成: ${signature}`)
                    setLogString(logArray.join('\n'))
                    setGasToPay(false)
                }
            } catch (error) {
                if (error instanceof Error) {
                    logArray.push(`错误: ${error.name}`)
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
                            logArray.push(`资产钱包 ${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)} Token余额不足`)
                            setLogString(logArray.join('\n'))
                        }
                        return
                    }
                    if (payMintGelegate !== gasPublicKeyString || (payMintGelegatedAmount < mintAmount)) {
                        // approve
                        // console.log('approve')
                        logArray.push('执行授权操作')
                        setLogString(logArray.join('\n'))
                        await approveTokens(
                            connection,
                            mintAddress,
                            gasSecretKeyString,
                            paySecretKeyString
                        )
                        // console.log('approve success')
                        logArray.push('授权完成')
                        setLogString(logArray.join('\n'))
                    }
                }
                // transfer
                setInExecution(true)
                if (mintAmount) {
                    // console.log('transfer PayToRecevie')
                    logArray.push(`开始发送交易 (资产钱包到接收钱包 ${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)} -> ${receviePublicKeyString.slice(0, 4)}...${receviePublicKeyString.slice(-3)})`)
                    setLogString(logArray.join('\n'))
                    let signature = await transferTokens(
                        connection,
                        mintAddress,
                        gasSecretKeyString,
                        payPublicKeyString,
                        receviePublicKeyString,
                        mintAmount * 10 ** 9
                    )
                    logArray.push(`交易完成: ${signature}`)
                    setLogString(logArray.join('\n'))
                    // console.log('transfer success')
                }
                setPayToRecevie(false)
                isAutoSubmited && setAutoSubmited(false)
                await getAllMintAccountInfo()
            } catch (error) {
                if (error instanceof Error) {
                    logArray.push(`错误: ${error.name}`)
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
        // 检查余额
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
                // 定时任务
                setTimeout(autoTimer, 1000)
            } else if (isTimerStart) {
                setTimerStart(false)
            }
        }

        timerHandler().catch(console.error)
    })

    const [mintAddress, setMintAddress] = useState<string>("")
    const [mintAmount, setMintAmount] = useState<number>()
    const [mintDecimals, setMintDecimals] = useState<number>(9)
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

    const [logString, setLogString] = useState("初始化，请输入Token地址和数量……")

    return (
        <div {...rest}>
            <Input
                placeholder="Token地址 *"
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
                    placeholder="数量 *"
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
                        取消
                    </Button>
                    :
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => handleConfirm()}
                        disabled={isConfirming}
                    >
                        {isConfirming ? <CircularProgress size={26} /> : "确认"}
                    </Button>
                }
            </div>
            <FormGroup>
                {gasPublicKeyString !== receviePublicKeyString ?
                    <FormControlLabel
                        control={<Checkbox checked={isGasToPay} />}
                        disabled={isSubmited || isAutoSubmited || !isConfirmed}
                        onChange={handleGasToPayChecked}
                        label={`从操作钱包(${gasPublicKeyString.slice(0, 4)}...${gasPublicKeyString.slice(-3)})转入(${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)})`} />
                    :
                    <></>
                }
                <FormControlLabel
                    control={<Checkbox checked={isPayToRecevie} />}
                    disabled={isSubmited || isAutoSubmited || !isConfirmed}
                    onChange={handlePayToRecevieChecked}
                    label={`从(${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)})转到接收地址(${receviePublicKeyString.slice(0, 4)}...${receviePublicKeyString.slice(-3)})`} />
            </FormGroup>
            {
                isAutoSubmited || isSubmited ?
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => handleCancel()}
                        disabled={inExecution}
                    >
                        {inExecution ? <CircularProgress size={26} /> : "取消任务"}
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
                                立即执行勾选的操作
                            </Button>
                            :
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={() => handleAutoExecution()}
                                disabled={!isConfirmed}
                            >
                                余额足够时自动执行
                            </Button>
                    )
            }
            <TextField
                id="standard-multiline-static"
                label="执行输出"
                multiline
                rows={10}
                variant="filled"
                value={logString}
                style={{ width: '100%', maxWidth: 400 }}
            />
        </div >
    )
}