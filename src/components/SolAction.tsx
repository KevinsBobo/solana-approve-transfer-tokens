import { Button } from "@mui/material"
import { useSubmit } from "../hooks"
import { checkAccount, createMintAndTransferTokens } from "../hooks/useSubmit"

export interface SolActionProps {
    [x: string]: any
}

export const SolAction = ({
    ...rest
}: SolActionProps) => {

    const { submit } = useSubmit()
    const handleSubmit = () => {
        // submit()
        createMintAndTransferTokens()
    }

    return (
        <div {...rest}>
            <Button
                color="primary"
                variant="contained"
                onClick={() => handleSubmit()}
            >
                Submit
            </Button>
        </div>
    )
}