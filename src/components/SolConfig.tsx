import { Button, TextField } from "@mui/material"
import { useEffect, useState } from "react"

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
        const error = inputDataMap[event.target.id].valueErrorProps[0]
        const setErrorFunction = inputDataMap[event.target.id].valueErrorProps[1]
        if (inputDataMap[event.target.id].required && inputString.length <= 0 && !error) {
            setErrorFunction(true)
        } else if (error) {
            setErrorFunction(false)
        }
        const setValueFunction = inputDataMap[event.target.id].valueProps[1]
        setValueFunction(inputString)
    }

    const [isSaved, setSaved] = useState<boolean>(false)

    useEffect(() => {
        setSaved(keysData.size > 0)
    })

    const handleSave = () => {
        for (let key in inputDataMap) {
            keysData.set(key, inputDataMap[key])
        }
        setSaved(true)
    }

    const handleEdit = () => {
        keysData.forEach((element, key) => {
            inputDataMap[key].valueProps[1](element.valueProps[0])
        })
        keysData.clear()
        setSaved(false)
    }


    return (
        <div {...rest}>
            {Object.keys(inputDataMap).map(key => {
                return (
                    <TextField
                        id={key}
                        key={key}
                        label={inputDataMap[key].label}
                        color="secondary"
                        error={inputDataMap[key].valueErrorProps[0]}
                        fullWidth={true}
                        value={isSaved ? keysData.get(key)?.valueProps[0] : inputDataMap[key].valueProps[0]}
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
        </div>
    )
}