import {
    NETWORK_MAIN,
} from "../Main"
import { Cluster, clusterApiUrl, Connection } from '@solana/web3.js';
import {
    getAccountBalance,
} from "../hooks";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Alert, Button, CircularProgress, Snackbar } from "@mui/material";

export interface SolDataProps {
    selectedNetwork: Cluster,
    gasPublicKeyString: string,
    payPublicKeyString: string,
    gasBalanceRows: {}[],
    setGasBalanceRows: React.Dispatch<React.SetStateAction<{}[]>>,
    payBalanceRows: {}[],
    setPayBalanceRows: React.Dispatch<React.SetStateAction<{}[]>>,
    [x: string]: any
}

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 0 },
    { field: 'address', headerName: 'TokenAddress', width: 420 },
    { field: 'balance', headerName: 'Balance', width: 120 },
]


export const SolData = ({
    selectedNetwork,
    gasPublicKeyString,
    payPublicKeyString,
    gasBalanceRows,
    setGasBalanceRows,
    payBalanceRows,
    setPayBalanceRows,
    keysData,
    ...rest
}: SolDataProps) => {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl(selectedNetwork), 'confirmed')
    const [isRefresh, setRefresh] = useState(false)

    async function refreshData() {
        // console.log('refresh')
        setRefresh(true)
        try {
            const gasAccountBalance = await getAccountBalance(connection, gasPublicKeyString)
            setGasBalanceRows(gasAccountBalance)
            const payAccountBalance = await getAccountBalance(connection, payPublicKeyString)
            setPayBalanceRows(payAccountBalance)
        } catch (error) {
            setShowRefreshError(true)
            console.log(error)
        }
        setRefresh(false)
    }

    useEffect(() => {
        !isRefresh && gasBalanceRows.length <= 0 && payBalanceRows.length <= 0 && refreshData()
    })

    const [showRefreshError, setShowRefreshError] = useState<boolean>(false)
    const handleCloseRefreshError = (event: React.SyntheticEvent | Event) => {
        showRefreshError && setShowRefreshError(false)
    }

    return (
        <div {...rest}>
            <Button
                onClick={() => refreshData()}
                disabled={isRefresh}
            >
                {isRefresh ? <CircularProgress size={26} /> : "刷新"}
            </Button>
            <div style={{ height: 400, width: '100%', maxWidth: 600 }}>
                <DataGrid
                    rows={gasBalanceRows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>
            <div style={{ height: 400, width: '100%', maxWidth: 600 }}>
                <DataGrid
                    rows={payBalanceRows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>
            <Snackbar
                open={showRefreshError}
                autoHideDuration={5000}
                onClose={handleCloseRefreshError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseRefreshError} severity="error">
                    刷新失败，请重试！
                </Alert>
            </Snackbar>
        </div>
    )
}
