const path = require('path')
const mongoose = require('mongoose')


const VARIABLE = require(path.join(__dirname, './variable'))
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const { Types } = require('mongoose');
const Coins = require(VARIABLE.MODELS_DIR + '/Coins');
const User = require(VARIABLE.MODELS_DIR + '/Users')
const Invest = require(VARIABLE.MODELS_DIR + '/Invests')
const Chains = require(VARIABLE.MODELS_DIR + '/Chains');
const Auth = require(VARIABLE.AUTH_DIR + '/auth')

mongoose.connect(
    VARIABLE.CONNECT_STRING2,
    {
        useNewUrlParser: true ,
        useUnifiedTopology: true,
        useFindAndModify : true
    }
).then(r =>console.log('connect roi nha dkm'))


const chains = [
    {
        name:'Bitcoin',
        symbol:'BTC',
        coins: [
            {
                name:'Bitcoin',
                symbol:'BTC'
            }
        ]
    },{
        name:'Tron',
        symbol:'TRX',
        coins: [
            {
                name:'Tron',
                symbol:'TRX'
            },
            {
                name:'Kingdom Game 4.0',
                symbol:'KDG'
            },
            {
                name:'USDT Tron',
                symbol:'USDT-TRC20'
            }
            
        ]
    },{
        name:'Tomo Chain',
        symbol:'TOMO',
        coins: [
            {
                name:'Tomo Chain',
                symbol:'TOMO'
            }
        ]
    },{
        name:'Ethereum',
        symbol:'ETH',
        coins: [
            {
                name:'Ether',
                symbol:'ETH'
            },
            {
                name:'Kyper Network',
                symbol:'KNC'
            },
            {
                name:'Meconcash',
                symbol:'MCH'
            },
            {
                name:'USDT Ethereum',
                symbol:'USDT-ERC20'
            }
        ]
    }
]

const createToken = async()=>{
    try{
        for (let index = 0; index < chains.length; index++) {
            const chain = new Chains({
                name : chains[index].name,
                symbol : chains[index].symbol,
            })
            for (let k = 0; k < chains[index].coins.length; k++) {
                const coin = new Coins({
                    name: chains[index].coins[k].name,
                    symbol: chains[index].coins[k].symbol,
                    chains: chain._id
                })
                await coin.save()
                chain.coins.push(coin._id)
                await chain.save()
            }  
        }
    }catch(er){
        console.log(er);
    }
}

createToken().then(res=>{
    console.log(res);
})