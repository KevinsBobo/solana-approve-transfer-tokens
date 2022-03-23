export interface SolDataProps {
    [x: string]: any
}

export const SolData = ({
    ...rest
}: SolDataProps) => {
    return (
        <div {...rest}>

        </div>
    )
}