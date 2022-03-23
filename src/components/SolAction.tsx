import { Button } from "@mui/material"
import { useSubmit } from "../hooks"
import { keysData } from "./SolConfig"

export interface SolActionProps {
    [x: string]: any
}

export const SolAction = ({
    ...rest
}: SolActionProps) => {

    const { submit } = useSubmit()
    const handleSubmit = () => {
        // submit()
        console.log(keysData)
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