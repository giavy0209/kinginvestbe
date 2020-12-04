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
const axios = require('axios');
const Users = require('./models/Users');

mongoose.connect(
    VARIABLE.CONNECT_STRING2,
    {
        useNewUrlParser: true ,
        useUnifiedTopology: true,
        useFindAndModify : true
    }
).then(r =>console.log('connect roi nha dkm'))


// const chains = [
//     {
//         name:'Bitcoin',
//         symbol:'BTC',
//         coins: [
//             {
//                 name:'Bitcoin',
//                 symbol:'BTC'
//             }
//         ]
//     },{
//         name:'Tron',
//         symbol:'TRX',
//         coins: [
//             {
//                 name:'Tron',
//                 symbol:'TRX'
//             },
//             {
//                 name:'Kingdom Game 4.0',
//                 symbol:'KDG'
//             },
//             {
//                 name:'USDT Tron',
//                 symbol:'USDT-TRC20'
//             }
            
//         ]
//     },{
//         name:'Tomo Chain',
//         symbol:'TOMO',
//         coins: [
//             {
//                 name:'Tomo Chain',
//                 symbol:'TOMO'
//             }
//         ]
//     },{
//         name:'Ethereum',
//         symbol:'ETH',
//         coins: [
//             {
//                 name:'Ether',
//                 symbol:'ETH'
//             },
//             {
//                 name:'Kyper Network',
//                 symbol:'KNC'
//             },
//             {
//                 name:'Meconcash',
//                 symbol:'MCH'
//             },
//             {
//                 name:'USDT Ethereum',
//                 symbol:'USDT-ERC20'
//             }
//         ]
//     }
// ]

// const createToken = async()=>{
//     try{
//         for (let index = 0; index < chains.length; index++) {
//             const chain = new Chains({
//                 name : chains[index].name,
//                 symbol : chains[index].symbol,
//             })
//             for (let k = 0; k < chains[index].coins.length; k++) {
//                 const coin = new Coins({
//                     name: chains[index].coins[k].name,
//                     symbol: chains[index].coins[k].symbol,
//                     chains: chain._id
//                 })
//                 await coin.save()
//                 chain.coins.push(coin._id)
//                 await chain.save()
//             }  
//         }
//     }catch(er){
//         console.log(er);
//     }
// }

// createToken().then(res=>{
//     console.log(res);
// })


// Create sample data user

const m1 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
const m2 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

const createUser = async()=>{
    for (let i = 0; i < m1.length; i++) {
        const user1 = {
            email: `level${i}@gmail.com`,
            password:'tra1998765tra-?',
            ref_code: 'ajskdkasjfjfhks'
        }
        await axios.post('http://178.128.60.247:3000/user', user1)
        .then(async (res)=>{
            for (let j = 0; j < m2.length; j++) {
                const user2 = {
                    email: `level${i}/${j}@gmail.com`,
                    password:'tra1998765tra-?',
                    ref_code: res.data.result.ref_code
                }
                const user3 = await axios.post('http://178.128.60.247:3000/user',user2)
                user2.ref_code = user3.data.result.ref_code
                user2.email = `level${i}/${j}.1@gmail.com`
                
                console.log(`Hoan thanh user 1/${j}/${i}`);

                const user4 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user4.data.result.ref_code
                user2.email = `level${i}/${j}.2@gmail.com`

                console.log(`Hoan thanh user 2/${j}/${i}`);

                const user5 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user5.data.result.ref_code
                user2.email = `level${i}/${j}.3@gmail.com`

                console.log(`Hoan thanh user 3/${j}/${i}`);

                const user6 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user6.data.result.ref_code
                user2.email = `level${i}/${j}.4@gmail.com`

                console.log(`Hoan thanh user 4/${j}/${i}`);

                const user7 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user7.data.result.ref_code
                user2.email = `level${i}/${j}.5@gmail.com`
                
                console.log(`Hoan thanh user 5/${j}/${i}`);

                const user8 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user8.data.result.ref_code
                user2.email = `level${i}/${j}.6@gmail.com`

                console.log(`Hoan thanh user 6/${j}/${i}`);

                const user9 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user9.data.result.ref_code
                user2.email = `level${i}/${j}.7@gmail.com`

                console.log(`Hoan thanh user 7/${j}/${i}`);

                const user10 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user10.data.result.ref_code
                user2.email = `level${i}/${j}.8@gmail.com`

                console.log(`Hoan thanh user 8/${j}/${i}`);

                const user11 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user11.data.result.ref_code
                user2.email = `level${i}/${j}.9@gmail.com`

                console.log(`Hoan thanh user 9/${j}/${i}`);

                const user12 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user12.data.result.ref_code
                user2.email = `level${i}/${j}.10@gmail.com`

                console.log(`Hoan thanh user 10/${j}/${i}`);

                const user13 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user13.data.result.ref_code
                user2.email = `level${i}/${j}.11@gmail.com`

                console.log(`Hoan thanh user 11/${j}/${i}`);

                const user14 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user13.data.result.ref_code
                user2.email = `level${i}/${j}.12@gmail.com`

                console.log(`Hoan thanh user 12/${j}/${i}`);

                const user15 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user15.data.result.ref_code
                user2.email = `level${i}/${j}.13@gmail.com`

                console.log(`Hoan thanh user 13/${j}/${i}`);

                const user16 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user16.data.result.ref_code
                user2.email = `level${i}/${j}.14@gmail.com`

                console.log(`Hoan thanh user 14/${j}/${i}`);

                const user17 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user17.data.result.ref_code
                user2.email = `level${i}/${j}.15@gmail.com`

                console.log(`Hoan thanh user 15/${j}/${i}`);

                const user18 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user18.data.result.ref_code
                user2.email = `level${i}/${j}.16@gmail.com`

                console.log(`Hoan thanh user 16/${j}/${i}`);

                const user19 = await axios.post('http://178.128.60.247:3000/user', user2)
                user2.ref_code = user3.data.result.ref_code
                user2.email = `level${i}/${j}.117@gmail.com`

                console.log(`Hoan thanh user 18/${j}/${i}`);
            }
        }).catch(err => {
            console.log(err)
        })
    }
}

const addListLock = async ()=>{
    const users = await User.find({})
    for (let index = 0; index < users.length; index++) {
        if(users[index].email === 'admin'){
            continue
        }
        users[index].listLockFunction = []
        await users[index].save()
        console.log(index, '/', users.length);
    }
}

addListLock()

// const user2 = {
//     email: "levelfsssssss@gmail.com",
//     password:"tra1998765tra",
//     ref_code: "ajskdkasjfjfhks"
// }

// const crUser = async()=>{
//     const user6 = await axios.post('http://178.128.60.247:3000/user', user2)
//     console.log(user6.data.data.result.ref_code);
//     return;
// }
// crUser()