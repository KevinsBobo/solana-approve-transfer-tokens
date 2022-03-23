import { Box, createTheme, Tab } from "@mui/material"
import { TabContext, TabList, TabPanel } from "@mui/lab"
import { useState } from "react"
import { makeStyles } from "@mui/styles"
import { SolConfig, SolData, SolAction } from "./components"


export const Main = () => {
    const theme = createTheme()
    const useStyles = makeStyles({
        tabContent: {
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
        tabPanel: {
            display: "flex",
            flexDirection: "column",
            alignItems: 'center'
        }
    })
    const classes = useStyles()

    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }

    return (
        <Box className={classes.box}>
            <TabContext value={selectedTokenIndex.toString()}>
                <TabList onChange={handleChange} aria-label="stake form tabs" centered>
                    <Tab label="配置" value="0" />
                    <Tab label="数据" value="1" />
                    <Tab label="操作" value="2" />
                </TabList>
                <TabPanel value="0" className={classes.tabPanel}>
                    <SolConfig
                        className={classes.tabContent}
                    />
                </TabPanel>
                <TabPanel value="1" className={classes.tabPanel}>
                    <SolData
                        className={classes.tabContent}
                    />
                </TabPanel>
                <TabPanel value="2" className={classes.tabPanel}>
                    <SolAction
                        className={classes.tabContent}
                    />
                </TabPanel>
            </TabContext>
        </Box>
    )
}