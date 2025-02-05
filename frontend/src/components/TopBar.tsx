import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

const TopBar = () => {
    return (
        <div className="flex">
            <h1 className="text-2xl flex-none font-light">Solana Portfolio</h1>
            <div className="grow"></div>
            <WalletMultiButton></WalletMultiButton>
        </div>
    )
}
export default TopBar