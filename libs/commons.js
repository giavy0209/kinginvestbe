const path = require('path')
var jwt = require('jsonwebtoken')
const VARIABLE = require(path.join(__dirname, '../variable'))
const User = require(VARIABLE.MODELS_DIR + '/Users')
const Invest = require(VARIABLE.MODELS_DIR + '/Invests')
const Coin = require(VARIABLE.MODELS_DIR + '/Coins')
const Balance = require(VARIABLE.MODELS_DIR + '/Balances')
const Wallet = require(VARIABLE.MODELS_DIR + '/Wallets')

var response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express

function findMissParams(obj, checkProps) {
	if (!Array.isArray(checkProps)) {
		checkProps = [checkProps];
	}

	var missProps = [];

	checkProps.forEach(prop=> {
		if (!Object.keys(obj).includes(prop)) {
			missProps.push(prop);
		}
	})

	return missProps;
};

function checkMissParams(res, obj, checkProps) {
	var missProps = findMissParams(obj, checkProps);
	if (missProps[0]) {
		response_express.exception(res, "Miss some params: " + missProps.toString())
		return true;
	}
	return false;
};

function createToken(user, expire) {
	return jwt.sign(user, VARIABLE.secret, {
		expiresIn: expire
	});
}

async function isMaxProfit(value, max_profit){
	if(value > max_profit){
		return true
	}
	return false
}

async function checkActivateDate(dateActive){
	const time  = Date.now() - dateActive
	if(time >= 172800){
		return true
	}
	return false
}

async function checkLevel(idUser){
    var id = idUser
    for (let lidex = 0; lidex < 1; lidex++) {
        var find_user = await User.findById(id)
        if(find_user.email === 'admin'){
            break
        }
		if(find_user.level === 0){
			if(find_user.childs.length >= 10){
				find_user.populate('invests')
				var list_child = find_user.childs
				var next_list_child = find_user.childs
				for (let index = 0; index < 20; index++) {
					var find_child = await User.find({_id : {$in : next_list_child}})
					next_list_child.length = 0
					find_child.forEach(_child => {
						next_list_child = [...next_list_child , ..._child.childs]
					})
					
		
					list_child = [...list_child,...next_list_child]
				}

				const total = await Invest.aggregate([
					{
						$match : {
							user : {$in : list_child}
						}
					},
					{$group : {
						_id : null,
						sum : {$sum : '$value'}
					}}
				])
				console.log(total,'wwkwkwkwwkwkwkwkwkwkwk');
				if(total >= 150000){
					find_user.level = 1
					await find_user.save()
				}
			}
		} else if(find_user.level === 1){
            console.log('1');
            const child =  await User.find({_id : {$in : find_user.childs}})
            var f1Amount = 0
			child.forEach(_child => {
                if(_child.level === 1){
                    f1Amount++
                }
            })
            if(f1Amount >= 3){
                find_user.level = 2
                await find_user.save()
            }
        } else if(find_user.level === 2){
            console.log('2');
            const child =  await User.find({_id : {$in : find_user.childs}})
            var f1Amount = 0
			child.forEach(_child => {
                if(_child.level === 2){
                    f1Amount++
                }
            })
            if(f1Amount >= 3){
                find_user.level = 3
                await find_user.save()
            }
            console.log('level2');
        } else if(find_user.level === 3){
			console.log('3');
			var list_child = find_user.childs
			var next_list_child = find_user.childs
			for (let index = 0; index < 20; index++) {
				var find_child = await User.find({_id : {$in : next_list_child}})
				next_list_child.length = 0
				find_child.forEach(_child => {
					next_list_child = [...next_list_child , ..._child.childs]
				})
				
	
				list_child = [...list_child,...next_list_child]
			}

			const total = await User.aggregate([
				{
					$match : {
						_id : {$in : list_child}
					}
				},
				{$group : {
					_id : {level: "$level"},
					amountLV3 : {$sum: 1}
				}}
			])
            if(total.amountLV3 >= 3){
                find_user.level = 4
                await find_user.save()
            }
        } else{	
            console.log('Nothing!');
        }
        id = find_user.parent
	}
}



module.exports = {
	findMissParams,
	checkMissParams,
	createToken,	
	isMaxProfit,
	checkActivateDate,
	checkLevel
}