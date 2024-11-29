import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

const TopBar = () => {
    return (
        <div className="flex">
            <h1 className="text-2xl flex-none font-semibold">Cryptocurrencies</h1>
            <div className="grow"></div>
            <WalletMultiButton></WalletMultiButton>
        </div>
    )
}
export default TopBar