import { Box, createTheme, Tab } from "@mui/material"
import { TabContext, TabList, TabPanel } from "@mui/lab"
import { useState } from "react"
import { makeStyles } from "@mui/styles"
import { SolConfig, SolData, SolAction } from "./components"


export const Main = () => {
    const theme = createTheme()
    const useStyles = makeStyles({
        tabContent: {
            padding: theme.spacing(4),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: theme.spacing(4),
        }
    })
    const classes = useStyles()

    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }

    return (
        <Box>
            <TabContext value={selectedTokenIndex.toString()}>
                <TabList onChange={handleChange} aria-label="stake form tabs">
                    <Tab label="配置" value="0" />
                    <Tab label="数据" value="1" />
                    <Tab label="操作" value="2" />
                </TabList>
                <TabPanel value="0">
                    <SolConfig
                        className={classes.tabContent}
                    />
                </TabPanel>
                <TabPanel value="1">
                    <SolData
                        className={classes.tabContent}
                    />
                </TabPanel>
                <TabPanel value="2">
                    <SolAction
                        className={classes.tabContent}
                    />
                </TabPanel>
            </TabContext>
        </Box>
    )
}