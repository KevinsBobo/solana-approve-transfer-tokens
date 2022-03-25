import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Input } from "@mui/material"
import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js"
import React, { useEffect } from "react"
import { useState } from "react"
import {
    getMintDecimals,
    getMintAccountInfo
} from "../hooks"

export interface SolActionProps {
    selectedNetwork: Cluster,
    gasSecretKeyString: string,
    gasPublicKeyString: string,
    paySecretKeyString: string,
    payPublicKeyString: string,
    receviePublicKeyString: string,
    [x: string]: any
}

export const SolAction = ({
    selectedNetwork,
    gasSecretKeyString,
    gasPublicKeyString,
    paySecretKeyString,
    payPublicKeyString,
    receviePublicKeyString,
    ...rest
}: SolActionProps) => {
    const connection = new Connection(clusterApiUrl(selectedNetwork), 'confirmed')

    const handleCancel = () => {
        setSubmited(false)
    }

    async function handleExecution() {
        setSubmited(true)
        setInExecution(true)
        // const declimals = await getMintDecimals(connection, mintAddress)
        setInExecution(false)
        setSubmited(false)
    }

    const handleAutoExecution = () => {
        setSubmited(true)
    }

    async function getAllMintAccountInfo(isAuto: boolean = false) {
        // 获取余额、授权信息
        if (!isAuto || isGasToPay) {
            const gasMintAccountInfo = await getMintAccountInfo(connection, mintAddress, gasPublicKeyString)
            const gasAmount = Number(
                gasMintAccountInfo?.amount ?
                    gasMintAccountInfo.amount / BigInt(10 ** mintDecimals) :
                    0
            )
            setGasMintAmount(gasAmount)
            if (!isAuto || gasAmount !== gasMintAmount) {
                console.log(`操作钱包余额: ${gasAmount}`)
            }
        }
        if (!isAuto && receviePublicKeyString !== gasPublicKeyString) {
            const recevieMintAccountInfo = await getMintAccountInfo(connection, mintAddress, receviePublicKeyString)
            const recevieAmount = Number(
                recevieMintAccountInfo?.amount ?
                    recevieMintAccountInfo.amount / BigInt(10 ** mintDecimals) :
                    0
            )
            setRecevieMintAmount(recevieAmount)
            if (!isAuto && recevieAmount !== recevieMintAmount) {
                console.log(`接收地址余额: ${recevieAmount / 10 ** mintDecimals}`)
            }
        }
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
        if (!isAuto || payAmount !== payMintAmount) {
            console.log(`资产钱包余额: ${payAmount / 10 ** mintDecimals}`)
        }
        if (!isAuto || payMintGelegate !== payMintApproveAddress) {
            console.log(`授权地址: ${payMintGelegate}`)
        }
        if (!isAuto || payMintGelegatedAmount !== payMintApproveAmount) {
            console.log(`授权数量: ${payMintGelegatedAmount / 10 ** mintDecimals}`)
        }
        setPayMintAmount(payAmount)
        setPayMintApproveAddress(payMintGelegate)
        setPayMintApproveAmount(payMintGelegatedAmount)
        if (payMintGelegate !== gasPublicKeyString || !mintAmount || payMintGelegatedAmount < mintAmount) {
            isApproved && setApproved(false)
        } else {
            !isApproved && setApproved(true)
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
        } else {

        }
        setConfirming(false)
    }

    const handleEdit = () => {
        isConfirmed && setConfirmed(false)
        isApproved && setApproved(false)
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

    function handleGasToPayChecked(event: React.SyntheticEvent<Element, Event>, checked: boolean) {
        // 检查余额
        checkBalanceEnough(checked, isPayToRecevie)
        setGasToPay(checked)
    }

    function handlePayToRecevieChecked(event: React.SyntheticEvent<Element, Event>, checked: boolean) {
        checkBalanceEnough(isGasToPay, checked)
        setPayToRecevie(checked)
    }

    async function autoGetAllMintAccountInfo() {
        await getAllMintAccountInfo(true)
        if (isConfirmed) {
            console.log("refresh")
            // setTimeout(autoGetAllMintAccountInfo, 1000)
        }
    }

    useEffect(() => {
        if (!accountTimer && isConfirmed) {
            // 定时任务
            const timer = setInterval(autoGetAllMintAccountInfo, 2000)
            setAccountTimer(timer)
        } else if (accountTimer && !isConfirmed) {
            clearInterval(accountTimer)
            setAccountTimer(undefined)
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

    const [isConfirmed, setConfirmed] = useState(false)
    const [isConfirming, setConfirming] = useState(false)
    const [accountTimer, setAccountTimer] = useState<NodeJS.Timer | undefined>()
    const [isSubmited, setSubmited] = useState(false)
    const [inExecution, setInExecution] = useState(false)

    const [isAmountEnough, setAmountEnough] = useState(true)
    const [isApproved, setApproved] = useState(false)
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
                        编辑
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
                    control={<Checkbox checked={!isApproved} />}
                    disabled={isSubmited || !isConfirmed}
                    label={!isApproved ? "授权（必选）" : "已授权"} />
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