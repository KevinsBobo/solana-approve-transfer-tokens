import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Input } from "@mui/material"
import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js"
import React, { useEffect } from "react"
import { useState } from "react"
import {
    getMintDecimals,
    getMintAccountInfo,
    approveTokens,
    transferTokens
} from "../hooks"

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
        const gasAmount = Number(
            gasMintAccountInfo?.amount ?
                gasMintAccountInfo.amount / BigInt(10 ** mintDecimals) :
                0
        )
        setGasMintAmount(gasAmount)
        return gasAmount
    }

    async function getRecevieMintAccountInfo() {
        const recevieMintAccountInfo = await getMintAccountInfo(connection, mintAddress, receviePublicKeyString)
        const recevieAmount = Number(
            recevieMintAccountInfo?.amount ?
                recevieMintAccountInfo.amount / BigInt(10 ** mintDecimals) :
                0
        )
        setRecevieMintAmount(recevieAmount)
        return recevieAmount
    }

    async function getPayMintAccountInfo() {
        const payMintAccountInfo = await getMintAccountInfo(connection, mintAddress, payPublicKeyString)
        const payAmount = Number(
            payMintAccountInfo?.amount ?
                payMintAccountInfo.amount / BigInt(10 ** mintDecimals) :
                0
        )
        const payMintGelegatedAmount = Number(
            payMintAccountInfo?.delegatedAmount ?
                payMintAccountInfo.amount / BigInt(10 ** mintDecimals) :
                0
        )
        const payMintGelegate = payMintAccountInfo?.delegate?.toBase58()
        setPayMintAmount(payAmount)
        setPayMintApproveAddress(payMintGelegate)
        setPayMintApproveAmount(payMintGelegatedAmount)
        return { payAmount, payMintGelegate, payMintGelegatedAmount }
    }

    async function getAllMintAccountInfo(isAuto: boolean = false) {
        // 获取余额、授权信息
        if (!isAuto || isGasToPay) {
            const gasAmount = await getGasMintAccountInfo()
            if (!isAuto || gasAmount !== gasMintAmount) {
                console.log(`操作钱包余额: ${gasAmount}`)
            }
        }
        if (!isAuto) {
            const recevieAmount = await getRecevieMintAccountInfo()
            if (!isAuto && recevieAmount !== recevieMintAmount) {
                console.log(`接收地址余额: ${recevieAmount}`)
            }
        }

        const { payAmount, payMintGelegate, payMintGelegatedAmount } = await getPayMintAccountInfo()
        if (!isAuto || payAmount !== payMintAmount) {
            console.log(`资产钱包余额: ${payAmount}`)
        }
        if (!isAuto || payMintGelegate !== payMintApproveAddress) {
            console.log(`授权地址: ${payMintGelegate}`)
        }
        if (!isAuto || payMintGelegatedAmount !== payMintApproveAmount) {
            console.log(`授权数量: ${payMintGelegatedAmount}`)
        }
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
            console.log("Token地址错误")
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

    function handleExecution() {
        setSubmited(true)
        execution()
        setSubmited(false)
    }

    const handleAutoExecution = () => {
        setSubmited(true)
    }

    async function execution(isAuto: boolean = false) {
        if (isGasToPay) {
            try {
                if (isAuto) {
                    const gasAmount = await getGasMintAccountInfo()
                    if (mintAmount && gasAmount < mintAmount) {
                        console.log('gasAmount not enough!')
                        return
                    }
                }
                // transfer
                setInExecution(true)
                console.log('transfer GasToPay')
                mintAmount && await transferTokens(
                    connection,
                    mintAddress,
                    gasSecretKeyString,
                    gasPublicKeyString,
                    payPublicKeyString,
                    mintAmount * 10 ** 9
                )
                console.log('transfer success')
                setGasToPay(false)
            } catch (error) {
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
                        console.log('payAmount not enough!')
                        return
                    }
                    if (payMintGelegate !== gasPublicKeyString || (payMintGelegatedAmount < mintAmount)) {
                        // approve
                        console.log('approve')
                        await approveTokens(
                            connection,
                            mintAddress,
                            gasSecretKeyString,
                            paySecretKeyString
                        )
                        console.log('approve success')
                    }
                }
                // transfer
                setInExecution(true)
                console.log('transfer PayToRecevie')
                mintAmount && await transferTokens(
                    connection,
                    mintAddress,
                    gasSecretKeyString,
                    payPublicKeyString,
                    receviePublicKeyString,
                    mintAmount * 10 ** 9
                )
                console.log('transfer success')
                setPayToRecevie(false)
                setSubmited(false)
                await getAllMintAccountInfo()
            } catch (error) {
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
        if (isTimerStart && isConfirmed) {
            setTimerStart(false)
            if (isSubmited && !inExecution) {
                execution(true)
            } else {
                console.log('refresh')
                getAllMintAccountInfo(true)
                checkBalanceEnough(isGasToPay, isPayToRecevie)
            }
            // 定时任务
            if (isConfirmed) {
                setTimeout(autoTimer, 1000)
            }
        } else if (isTimerStart) {
            setTimerStart(false)
        }
    })

    const [mintAddress, setMintAddress] = useState<string>("")
    const [mintAmount, setMintAmount] = useState<number>()
    const [mintDecimals, setMintDecimals] = useState<number>(9)
    const [gasMintAmount, setGasMintAmount] = useState<number>(0)
    const [payMintAmount, setPayMintAmount] = useState<number>(0)
    const [recevieMintAmount, setRecevieMintAmount] = useState<number>(0)
    const [payMintApproveAmount, setPayMintApproveAmount] = useState<number>(0)
    const [payMintApproveAddress, setPayMintApproveAddress] = useState<string | undefined>()

    const [isConfirming, setConfirming] = useState(false)
    const [isTimerStart, setTimerStart] = useState(false)
    const [isSubmited, setSubmited] = useState(false)
    const [inExecution, setInExecution] = useState(false)

    const [isAmountEnough, setAmountEnough] = useState(true)
    const [isGasToPay, setGasToPay] = useState(false)
    const [isPayToRecevie, setPayToRecevie] = useState(false)
    const [isEmptyInput, setEmptyInput] = useState(false)


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
                <FormControlLabel
                    control={<Checkbox checked={isGasToPay} />}
                    disabled={isSubmited || !isConfirmed}
                    onChange={handleGasToPayChecked}
                    label={`从操作钱包(${gasPublicKeyString.slice(0, 4)}...${gasPublicKeyString.slice(-3)})转入(${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)})`} />
                <FormControlLabel
                    control={<Checkbox checked={isPayToRecevie} />}
                    disabled={isSubmited || !isConfirmed}
                    onChange={handlePayToRecevieChecked}
                    label={`从(${payPublicKeyString.slice(0, 4)}...${payPublicKeyString.slice(-3)})转到接收地址(${receviePublicKeyString.slice(0, 4)}...${receviePublicKeyString.slice(-3)})`} />
            </FormGroup>
            {
                isSubmited ?
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => handleCancel()}
                        disabled={inExecution}
                    >
                        {inExecution ? <CircularProgress size={26} /> : "取消自动任务"}
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
        </div >
    )
}