import { Alert, Button, Snackbar, TextField } from "@mui/material"
import React, { useEffect, useState } from "react"

export interface SolConfigProps {
    [x: string]: any
}

interface InputProps {
    label: string,
    valueProps: [string, React.Dispatch<string>],
    valueErrorProps: [boolean, React.Dispatch<boolean>],
    required: boolean
}

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
        mintAddress:
        {
            label: "Token地址",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
        },
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
            const inputString = element.valueProps[0].trim()
            if (element.required && inputString.length <= 0) {
                !element.valueErrorProps[0] && element.valueErrorProps[1](true)
                isCorretInput = false
                isClick && !showEmptyInput && setShowEmptyInput(true)
            }
        })
        if (isCorretInput) {
            showEmptyInput && setShowEmptyInput(false)
            setSaved(true)
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


    return (
        <div {...rest}>
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
        </div>
    )
}