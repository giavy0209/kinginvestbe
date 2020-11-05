const fetch = require("node-fetch");
const { response_express } = require("../libs/responses");

const VARIABLE = require('../variable')
const Auth = require(VARIABLE.AUTH_DIR + '/auth')

const etherscan_api = "R6UWHB51I91M8H1W9A9C9M26UEYPGV392F";

module.exports = router =>{
    router.get(`/blockchain_transaction`, Auth.expressMiddleware, async (req, res) => {
        const { coin_type, address, begin_date, take, skip } = req.query;
        try
        {
            if(coin_type === "btc") {

                var link = "https://blockchain.info/rawaddr/" + address; //+ "?skip=" + skip + "&limit=" + take;
                var data_2 = await fetch(link);
                var data = await data_2.json();
                return response_express.success(res, data)
            }
            else if(coin_type === "eth") {
                var link = "https://api.etherscan.io/api?module=account&action=txlist&apikey=" + etherscan_api 
                         + "&address=" + address + "&startblock=" + "0" + "&endblock=99999999&sort=desc&offset=" + take + "&page=" + skip;
                var data = await fetch(link);
                data = await data.json();
                
                return response_express.success(res,data)
            }
            else if(coin_type === "usdt") {
                var link = "https://api.etherscan.io/api?module=account&action=tokentx&apikey=" + etherscan_api 
                         + "&contractaddress=" + USDT_CONTRACT          
                         + "&address=" + address + "&startblock=" + "0" + "&endblock=99999999&sort=desc&offset=" + take + "&page=" + skip;
                var data = await fetch(link);
                data = await data.json();
                
                return res.status(200).send({
                                            status: 1,
                                            data: data,
                                        });
            }
            else if(coin_type === "knc") {
                var link = "https://api.etherscan.io/api?module=account&action=tokentx&apikey=" + etherscan_api 
                         + "&contractaddress=" + KNC_CONTRACT          
                         + "&address=" + address + "&startblock=" + "0" + "&endblock=99999999&sort=desc&offset=" + take + "&page=" + skip;
                var data = await fetch(link);
                data = await data.json();
                
                return res.status(200).send({
                                            status: 1,
                                            data: data,
                                        });
            }
             else if(coin_type === "mch") {
                var link = "https://api.etherscan.io/api?module=account&action=tokentx&apikey=" + etherscan_api 
                         + "&contractaddress=" + MCH_CONTRACT          
                         + "&address=" + address + "&startblock=" + "0" + "&endblock=99999999&sort=desc&offset=" + take + "&page=" + skip;
                var data = await fetch(link);
                data = await data.json();
                
                return res.status(200).send({
                                            status: 1,
                                            data: data,
                                        });
            }
            else if(coin_type === "tron") {
                // begin_date = "yyyy-mm-dd"
                var date_to_unix = new moment(begin_date).valueOf(); //; moment(new Date()).valueOf();
                var link = "https://apilist.tronscan.org/api/transfer?sort=-timestamp&count=true&limit=" + take + "&start=" + skip + "&token=_&address=" + address;
                // var link = "https://api.trongrid.io/v1/accounts/" + address 
                //         + "/transactions?order_by=block_timestamp,desc&limit=" + take +"&only_to=true&only_confirmed=true&min_timestamp=" + date_to_unix;
                var data = await fetch(link);
                data = await data.json();
                
                return res.status(200).send({
                                            status: 1,
                                            data: data,
                                        });
            }
            else if(coin_type === "kdg") {
                var date_to_unix = new moment(begin_date).valueOf(); //; moment(new Date()).valueOf();
                var link = "https://apilist.tronscan.org/api/contract/events?address=" 
                        + address + "&limit=" + take + "&start_timestamp=" + date_to_unix + "&contract=" + KDG_CONTRACT;
                var data = await fetch(link);
                data = await data.json();
                
                return res.status(200).send({
                                            status: 1,
                                            data: data,
                                        });
            }
            else if(coin_type === "tomo") {
                var link = "https://scan.tomochain.com/api/txs/listByAccount/" + address + "?skip=" + skip + "&limit=" + take;
                var data = await fetch(link);
                data = await data.json();
                
                return res.status(200).send({
                                            status: 1,
                                            data: data,
                                        });
            }
             else if(coin_type === "usdt-trc20") {
                var date_to_unix = new moment(begin_date).valueOf(); //; moment(new Date()).valueOf();
                var link = "https://apilist.tronscan.org/api/contract/events?address=" 
                        + address + "&limit=" + take + "&start_timestamp=" + date_to_unix + "&contract=" + USDT_TRC20_CONTRACT;
                var data = await fetch(link);
                data = await data.json();
                
                return res.status(200).send({
                                            status: 1,
                                            data: data,
                                        });
            }
            else {
                return res.status(200).send({
                    status: 1,
                    err: "wrong coin type",
                });
            }
        }
        catch(er){
            return res.status(200).send({
                                        status: 0,
                                        err: er,
                                    });
        }
    });
}