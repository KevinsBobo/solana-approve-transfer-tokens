import { Box, createTheme, MenuItem, Tab, TextField } from "@mui/material"
import { TabContext, TabList, TabPanel } from "@mui/lab"
import { useState } from "react"
import { makeStyles } from "@mui/styles"
import { SolConfig, SolData, SolAction } from "./components"
import { Cluster } from "@solana/web3.js"

/**
 * 测试钱包
 * gasSecretKey    gasPublicKey
 * 5CJn8hnPKQ7KRo8D9YF4J98tt4C4bn7kgMXL6Bpc4H1srNqwmCTBNUcSfqWkBZReincY252rVDdfQReg7Jx7cztC
 * J92oTGnVCqxssS8JAKdBhJ3UHvQeHmscSRJKRTq3BhwA
 * paySecretKey    payPublicKey
 * 16sBQLdzGCXsv6uNXrH2tt7NbXnWuYAWr4ZUuWuvGrn7vRRFy39jdXgJCZrnL2L9gFv2wpS4L5WEeXNr4W7bpdm
 * FFK8inneASSTDALZhj5cKN4GUGsPqXedARAuWqtgEc23
 * recevieSecretKey   receviePublicKey
 * 4wz9UVEFV8HFtXGHp8fPEMhPwzYVh384Jm1qpmim2r9pZfF7qSwhGRr8ShZK7UMNNX8eSPdn4sRbzSH88n5hi7XN
 * 77SsSbSVGvMx18tnHgDq9cRPxUuJr9gHFoWqceB8TiRn
 */

export const NETWORK_MAIN: Cluster = 'mainnet-beta'
export const NETWORK_DEV: Cluster = 'devnet'
export const NETWORK_TEST: Cluster = 'testnet'

export const gasSecretKey = 'gasSecretKey'
export const gasPublicKey = 'gasPublicKey'
export const paySecretKey = 'paySecretKey'
export const payPublicKey = 'payPublicKey'
export const receviePublicKey = 'receviePublicKey'

// fix Buffer is not defined
window.Buffer = window.Buffer || require("buffer").Buffer;

export interface KeyInputProps {
    label: string,
    valueProps: [string, React.Dispatch<string>],
    valueErrorProps: [boolean, React.Dispatch<boolean>],
    required: boolean,
    type: string,
}

const currentNetwork = [
    {
        value: NETWORK_MAIN,
        label: '主网',
    },
    {
        value: NETWORK_DEV,
        label: '开发网',
    },
    {
        value: NETWORK_TEST,
        label: '测试网',
    },
]

const theme = createTheme()
const useStyles = makeStyles({
    tabContent: {
        padding: theme.spacing(2, 0),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: theme.spacing(3)
    },
    box: {
        alignItems: 'center',
        padding: theme.spacing(2)
    },
    header: {
        alignItems: 'center',
        justifyContent: "space-evenly",
        display: "flex"
    }
})


export const Main = () => {

    const classes = useStyles()

    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }

    const keysData: { [key: string]: KeyInputProps } = {
        gasSecretKey: {
            label: "操作钱包 私钥",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
            type: "password",
        },
        gasPublicKey:
        {
            label: "操作钱包 地址",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
            type: "text",
        },
        paySecretKey:
        {
            label: "资产钱包 私钥",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
            type: "password",
        },
        payPublicKey:
        {
            label: "资产钱包 地址",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
            type: "text",
        },
        receviePublicKey:
        {
            label: "接收资产钱包 地址（选填）",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: false,
            type: "text",
        },
    }

    const [configSaved, setConfigSaved] = useState<boolean>(false)
    const [selectedNetwork, setNetwork] = useState<Cluster>(NETWORK_DEV)

    const handleNetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNetwork(event.target.value as Cluster)
    }

    const [gasBalanceRows, setGasBalanceRows] = useState<Array<{}>>([])
    const [payBalanceRows, setPayBalanceRows] = useState<Array<{}>>([])
    const [recevieBalanceRows, setRecevieBalanceRows] = useState<Array<{}>>([])

    return (
        <Box className={classes.box}>
            <TabContext value={selectedTokenIndex.toString()}>
                <div className={classes.header}>
                    <TabList onChange={handleChange} aria-label="stake form tabs">
                        <Tab label="配置" value="0" />
                        <Tab label="资产" value="1" disabled={!configSaved} />
                        <Tab label="操作" value="2" disabled={!configSaved} />
                    </TabList>
                    <TextField
                        id="outlined-select-currency"
                        select
                        value={selectedNetwork}
                        onChange={handleNetChange}
                    >
                        {currentNetwork.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </div>
                <TabPanel value="0" >
                    <SolConfig
                        setSelectedTokenIndex={setSelectedTokenIndex}
                        configSaved={configSaved}
                        setConfigSaved={setConfigSaved}
                        keysData={keysData}
                        className={classes.tabContent}
                    />
                </TabPanel>
                <TabPanel value="1">
                    <SolData
                        selectedNetwork={selectedNetwork}
                        gasSecretKeyString={keysData[gasSecretKey].valueProps[0]}
                        gasPublicKeyString={keysData[gasPublicKey].valueProps[0]}
                        payPublicKeyString={keysData[payPublicKey].valueProps[0]}
                        receviePublicKeyString={
                            keysData[receviePublicKey].valueProps[0].length > 0 ?
                                keysData[receviePublicKey].valueProps[0] :
                                keysData[gasPublicKey].valueProps[0]
                        }
                        gasBalanceRows={gasBalanceRows}
                        setGasBalanceRows={setGasBalanceRows}
                        payBalanceRows={payBalanceRows}
                        setPayBalanceRows={setPayBalanceRows}
                        recevieBalanceRows={recevieBalanceRows}
                        setRecevieBalanceRows={setRecevieBalanceRows}
                        className={classes.tabContent}
                    />
                </TabPanel>
                <TabPanel value="2">
                    <SolAction
                        className={classes.tabContent}
                    />
                </TabPanel>
            </TabContext>
        </Box >
    )
}