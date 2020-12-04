const path = require('path')
const fetch = require("node-fetch");

const VARIABLE = require('../variable')
const btc_f = require(VARIABLE.BLC_DIR + '/btc_functions');
const erc_f = require(VARIABLE.BLC_DIR +'/erc20_functions');
const tron_f = require(VARIABLE.BLC_DIR + '/tron_functions');
const tomo_f = require(VARIABLE.BLC_DIR + '/tomo_functions');
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express

module.exports = router =>{
    const KDG_CONTRACT = 'TYM9eM22SCynRc5YaMxE2PX1kwv7H2rXAu';
    //route này làm gì?
    router.get(`/:coin_type/balance/:address`,  async (req, res) => {
        const { coin_type, address } = req.params;

        var balance = 0;

        try
        {
            if(coin_type === "btc") {
                balance = await btc_f.getBalanceBTC(address);
                //console.log("balance", balance)
                balance = Number(balance.balance.balance)/1e8;
                // console.log("balance btc", balance.balance)
                // console.log("balance btc 2", balance)
            } 
            else if(coin_type === "eth") {
                balance = await erc_f.getBalanceETH(address);
                balance = Number(balance.eth)/1e18;
            } else if(coin_type === "usdt") {
                balance = await erc_f.getBalanceUSDT(address);
                balance = balance.usdt/1e6;
            } else if(coin_type === "knc") {
                balance = await erc_f.getBalanceKNC(address);
                balance = balance.knc/1e18;
            } else if(coin_type === "mch") {
                balance = await erc_f.getBalanceMCH(address);
                balance = balance.mch/1e8;
            } 
            else if(coin_type === "tron") {
                balance = await tron_f.getBalanceTRX(address);
                balance = balance.trx/1e6;
            } else if(coin_type === "kdg") {
                balance = await tron_f.getBalanceKDG(KDG_CONTRACT, address);
                balance = parseInt(balance.kdg._hex, 16)/1e18;
            }
            else if(coin_type === "tomo") {
                balance = await tomo_f.getBalanceTOMO(address);
                balance = balance.tomo/1e18;
                //console.log("balance tomo", balance);
            }
             else if(coin_type === "usdt-trc20") {
                balance = await tron_f.getBalanceUSDT(USDT_CONTRACT, address);
                balance = balance.usdt/1e6;
            }

            return response_express.success(res,{coin_type: coin_type, address: address, balance: balance})
        }
        catch(er){
            return response_express.exception(res, {err: er})
        }
    });
    //route này làm gì?
    router.get(`/markets/coin_price`, async (req, res) => {
        const { coin_type } = req.query;
        try
        {
            if(coin_type === "KDG") {
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=kingdom-game-4-0&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();

                var link2 = "https://api.coingecko.com/api/v3/coins/kingdom-game-4-0?tickers=false&community_data=false&developer_data=false&sparkline=false";
                var data2 = await fetch(link2);
                data2 = await data2.json();
                return res.status(200).send({
                        status: 1,
                        data: data,
                        data2: data2.market_data,
                    });
            }
            else if(coin_type === "TRON") {
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();

                var link2 = "https://api.coingecko.com/api/v3/coins/tron?tickers=false&community_data=false&developer_data=false&sparkline=false";
                var data2 = await fetch(link2);
                data2 = await data2.json();
                return res.status(200).send({
                        status: 1,
                        data: data,
                        data2: data2.market_data,
                    });
            }
            else if(coin_type === "MCH") {
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=meconcash&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();
                
                var link2 = "https://api.coingecko.com/api/v3/coins/meconcash?tickers=false&community_data=false&developer_data=false&sparkline=false";
                var data2 = await fetch(link2);
                data2 = await data2.json();

                return res.status(200).send({
                        status: 1,
                        data: data,
                        data2: data2.market_data,
                    });
            }
            else if(coin_type === "KNC") {
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=kyber-network&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();
                
                var link2 = "https://api.coingecko.com/api/v3/coins/kyber-network?tickers=false&community_data=false&developer_data=false&sparkline=false";
                var data2 = await fetch(link2);
                data2 = await data2.json();

                return res.status(200).send({
                        status: 1,
                        data: data,
                        data2: data2.market_data,
                    });
            }
            else if(coin_type === "ETH") {
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();
                
                var link2 = "https://api.coingecko.com/api/v3/coins/ethereum?tickers=false&community_data=false&developer_data=false&sparkline=false";
                var data2 = await fetch(link2);
                data2 = await data2.json();

                return res.status(200).send({
                        status: 1,
                        data: data,
                        data2: data2.market_data,
                    });
            }
            else if(coin_type === "BTC") {
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();
                
                var link2 = "https://api.coingecko.com/api/v3/coins/bitcoin?tickers=false&community_data=false&developer_data=false&sparkline=false";
                var data2 = await fetch(link2);
                data2 = await data2.json();

                return res.status(200).send({
                        status: 1,
                        data: data,
                        data2: data2.market_data,
                    });
            }
            else if(coin_type === "USDT") {
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();
                
                var link2 = "https://api.coingecko.com/api/v3/coins/tether?tickers=false&community_data=false&developer_data=false&sparkline=false";
                var data2 = await fetch(link2);
                data2 = await data2.json();

                return res.status(200).send({
                        status: 1,
                        data: data,
                        data2: data2.market_data,
                    });
            }
            else if(coin_type === "TOMO") {
                var link = "https://api.coingecko.com/api/v3/simple/price?ids=tomochain&vs_currencies=usd";
                var data = await fetch(link);
                data = await data.json();
                
                var link2 = "https://api.coingecko.com/api/v3/coins/tomochain?tickers=false&community_data=false&developer_data=false&sparkline=false";
                var data2 = await fetch(link2);
                data2 = await data2.json();

                return res.status(200).send({
                        status: 1,
                        data: data,
                        data2: data2.market_data
                    });
            }
            else {
                await 
                    axios
                    .get("https://api.remitano.com/api/v1/markets/" + coin_type + "/order_book")
                    .then(result => {
                        console.log("result")
                        console.log(result.data.bids[0][0])

                        return res.status(200).send({
                            status: 1,
                            data: result.data.bids[0][0],
                        });
                    });
            }
        }
        catch(er){
            console.log("error:", er)
            return res.status(200).send({
                status: 0,
                err: er,
            });
        }
    });
}