import { NETWORK_MAIN } from "../Main"
import { Cluster, clusterApiUrl, Connection } from '@solana/web3.js';
import {
    getAccountBalance,
    getAirdorp,
    createMintAndTransferTokens,
} from "../hooks";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Alert, Button, CircularProgress, Snackbar } from "@mui/material";

export interface SolDataProps {
    selectedNetwork: Cluster,
    gasSecretKeyString: string,
    gasPublicKeyString: string,
    payPublicKeyString: string,
    receviePublicKeyString: string,
    gasBalanceRows: {}[],
    setGasBalanceRows: React.Dispatch<React.SetStateAction<{}[]>>,
    payBalanceRows: {}[],
    setPayBalanceRows: React.Dispatch<React.SetStateAction<{}[]>>,
    recevieBalanceRows: {}[],
    setRecevieBalanceRows: React.Dispatch<React.SetStateAction<{}[]>>,
    [x: string]: any
}

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 0 },
    { field: 'address', headerName: 'TokenAddress', width: 420 },
    { field: 'balance', headerName: 'Balance', width: 120 },
]

enum Operation {
    airdorp,
    mint,
    mintPay
}

const saveSelectedNetwork = Array<Cluster>()

export const SolData = ({
    selectedNetwork,
    gasSecretKeyString,
    gasPublicKeyString,
    payPublicKeyString,
    receviePublicKeyString,
    gasBalanceRows,
    setGasBalanceRows,
    payBalanceRows,
    setPayBalanceRows,
    recevieBalanceRows,
    setRecevieBalanceRows,
    keysData,
    ...rest
}: SolDataProps) => {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl(selectedNetwork), 'confirmed')

    async function refreshData() {
        // console.log('refresh')
        let isError = false
        if (isRefresh) {
            return
        }
        setRefresh(true)
        try {
            const gasAccountBalance = await getAccountBalance(connection, gasPublicKeyString)
            setGasBalanceRows(gasAccountBalance)
            const payAccountBalance = await getAccountBalance(connection, payPublicKeyString)
            setPayBalanceRows(payAccountBalance)
            const recevieAccountBalance = await getAccountBalance(connection, receviePublicKeyString)
            setRecevieBalanceRows(recevieAccountBalance)
        } catch (error) {
            isError = true
            !showRefreshError && setShowRefreshError(true)
            console.log(error)
        }
        !isError && !showRefreshSuccess && setShowRefreshSuccess(true)
        setRefresh(false)
    }

    async function operation(setStatus: React.Dispatch<React.SetStateAction<boolean>>, operationNO: Operation) {
        let isError = false
        setStatus(true)
        try {
            switch (operationNO) {
                case Operation.airdorp:
                    await getAirdorp(connection, gasPublicKeyString)
                    break
                case Operation.mint:
                    await createMintAndTransferTokens(connection, gasSecretKeyString, gasPublicKeyString)
                    break
                case Operation.mintPay:
                    await createMintAndTransferTokens(connection, gasSecretKeyString, payPublicKeyString)
                    break
            }
        } catch (error) {
            isError = true
            !showOperationError && setShowOperationError(true)
            console.log(error)
        }
        setStatus(false)
        !isError && !showOperationSuccess && setShowOperationSuccess(true)
        refreshData()
    }

    function airdorp() {
        operation(setAirdorp, Operation.airdorp)
    }

    function mint() {
        operation(setMint, Operation.mint)
    }

    function mintPay() {
        operation(setMintPay, Operation.mintPay)
    }

    useEffect(() => {
        saveSelectedNetwork.length <= 0 && saveSelectedNetwork.push(selectedNetwork)
        if (saveSelectedNetwork[0] !== selectedNetwork) {
            saveSelectedNetwork[0] = selectedNetwork
            !isRefresh && refreshData()
        }
        !isRefresh && gasBalanceRows.length <= 0 && payBalanceRows.length <= 0 && refreshData()
    })

    const [showRefreshError, setShowRefreshError] = useState<boolean>(false)
    const handleCloseRefreshError = (event: React.SyntheticEvent | Event) => {
        showRefreshError && setShowRefreshError(false)
    }
    const [showRefreshSuccess, setShowRefreshSuccess] = useState<boolean>(false)
    const handleCloseRefreshSuccess = (event: React.SyntheticEvent | Event) => {
        showRefreshSuccess && setShowRefreshSuccess(false)
    }
    const [showOperationError, setShowOperationError] = useState<boolean>(false)
    const handleCloseOperationError = (event: React.SyntheticEvent | Event) => {
        showOperationError && setShowOperationError(false)
    }
    const [showOperationSuccess, setShowOperationSuccess] = useState<boolean>(false)
    const handleCloseOperationSuccess = (event: React.SyntheticEvent | Event) => {
        showOperationSuccess && setShowOperationSuccess(false)
    }

    const [isRefresh, setRefresh] = useState(false)
    const [isAirdorp, setAirdorp] = useState(false)
    const [isMint, setMint] = useState(false)
    const [isMintPay, setMintPay] = useState(false)

    return (
        <div {...rest}>
            {selectedNetwork !== NETWORK_MAIN ?
                <div>
                    <Button
                        style={{ marginRight: 10, marginBottom: 10 }}
                        variant="contained"
                        onClick={() => airdorp()}
                        disabled={isAirdorp}
                    >
                        {isAirdorp ? <CircularProgress size={26} /> : "领取SOL"}
                    </Button>
                    <Button
                        style={{ marginRight: 10, marginBottom: 10 }}
                        variant="contained"
                        onClick={() => mint()}
                        disabled={isMint}
                    >
                        {isMint ? <CircularProgress size={26} /> : "创建测试Token"}
                    </Button>
                    <Button
                        style={{ marginBottom: 10 }}
                        variant="contained"
                        onClick={() => mintPay()}
                        disabled={isMintPay}
                    >
                        {isMintPay ? <CircularProgress size={26} /> : "创建测试Token到资产钱包"}
                    </Button>
                </div>
                :
                <></>
            }
            <Button
                color="success"
                variant="outlined"
                onClick={() => refreshData()}
                disabled={isRefresh}
            >
                {isRefresh ? <CircularProgress size={26} /> : "刷新"}
            </Button>
            <div style={{ height: 400, width: '100%', maxWidth: 600, marginBottom: 40 }}>
                <h4>操作钱包 {gasPublicKeyString}</h4>
                <DataGrid
                    rows={gasBalanceRows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>
            <div style={{ height: 400, width: '100%', maxWidth: 600, marginBottom: 40 }}>
                <h4>资产钱包 {payPublicKeyString}</h4>
                <DataGrid
                    rows={payBalanceRows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>
            {
                receviePublicKeyString !== gasPublicKeyString ?
                    <div style={{ height: 400, width: '100%', maxWidth: 600, marginBottom: 40 }}>
                        <h4>接收钱包 {receviePublicKeyString}</h4>
                        <DataGrid
                            rows={recevieBalanceRows}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                        />
                    </div>
                    :
                    <></>
            }
            <Snackbar
                open={showRefreshError}
                autoHideDuration={3000}
                onClose={handleCloseRefreshError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseRefreshError} severity="error">
                    刷新失败，请重试！
                </Alert>
            </Snackbar>
            <Snackbar
                open={showRefreshSuccess}
                autoHideDuration={2000}
                onClose={handleCloseRefreshSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseRefreshSuccess} severity="success">
                    刷新成功！
                </Alert>
            </Snackbar>
            <Snackbar
                open={showOperationError}
                autoHideDuration={5000}
                onClose={handleCloseOperationError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseOperationError} severity="error">
                    操作失败，请重试！
                </Alert>
            </Snackbar>
            <Snackbar
                open={showOperationSuccess}
                autoHideDuration={2000}
                onClose={handleCloseOperationSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseOperationSuccess} severity="success">
                    操作成功！
                </Alert>
            </Snackbar>
        </div>
    )
}
