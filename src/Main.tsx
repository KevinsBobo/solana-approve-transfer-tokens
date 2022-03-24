import { Box, createTheme, MenuItem, Tab, TextField } from "@mui/material"
import { TabContext, TabList, TabPanel } from "@mui/lab"
import { useState } from "react"
import { makeStyles } from "@mui/styles"
import { SolConfig, SolData, SolAction } from "./components"
import { Cluster } from "@solana/web3.js"

export const NETWORK_MAIN: Cluster = 'mainnet-beta'
export const NETWORK_DEV: Cluster = 'devnet'
export const NETWORK_TEST: Cluster = 'testnet'

export const gasSecretKey = 'gasSecretKey'
export const gasPublicKey = 'gasPublicKey'
export const paySecretKey = 'paySecretKey'
export const payPublicKey = 'payPublicKey'
export const recevieAddress = 'recevieAddress'

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
        alignItems: "center",
        gap: theme.spacing(3),
        width: "100%",
        maxWidth: theme.spacing(100)
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
            label: "操作钱包 公钥",
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
            label: "资产钱包 公钥",
            valueProps: useState<string>(""),
            valueErrorProps: useState<boolean>(false),
            required: true,
            type: "text",
        },
        recevieAddress:
        {
            label: "接收资产钱包 公钥 （选填）",
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

    return (
        <Box className={classes.box}>
            <TabContext value={selectedTokenIndex.toString()}>
                <div className={classes.header}>
                    <TabList onChange={handleChange} aria-label="stake form tabs">
                        <Tab label="配置" value="0" />
                        <Tab label="数据" value="1" disabled={!configSaved} />
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
                <TabPanel value="0">
                    <SolConfig
                        configSaved={configSaved}
                        setConfigSaved={setConfigSaved}
                        keysData={keysData}
                        className={classes.tabContent}
                    />
                </TabPanel>
                <TabPanel value="1">
                    <SolData
                        selectedNetwork={selectedNetwork}
                        gasPublicKeyString={keysData[gasPublicKey].valueProps[0]}
                        payPublicKeyString={keysData[payPublicKey].valueProps[0]}
                        gasBalanceRows={gasBalanceRows}
                        setGasBalanceRows={setGasBalanceRows}
                        payBalanceRows={payBalanceRows}
                        setPayBalanceRows={setPayBalanceRows}
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