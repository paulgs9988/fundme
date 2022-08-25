//import
//main
//calling of main function

// function deployFunc() {
//     console.log("*********TEST*********")
// }

// module.exports.default = deployFunc
//this above syntax is the same as below except below we are using an anonymous
//function

//"hre" is the hardhat run environment
// module.exports = async (hre) => {
//     const {getNamedAccounts, deployments} = hre
//     //same as: hre.getNamedAccounts and hre.deployments
// }
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

//Above can be shortened even more to:
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //Want to be able to do:
    //if chainId is X, use address Y, etc

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    //

    //when going on localhost or hardhat network, we want to use a mock for data feed
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //price feed address goes here
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //then we will verify
        await verify(fundMe.address, args)
    }
    log("**********************************")
}
module.exports.tags = ["all", "fundme"]
