const path = require('path')
const fs = require('fs')

const VARIABLE = require(path.join(__dirname, '../../variable'))
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const lib_common = require(VARIABLE.LIBS_DIR+'/commons');
const Auth = require(VARIABLE.AUTH_DIR + '/auth')

module.exports = (router)=>{
    router.post('/change_interest_rate_address_admin',Auth.isAdminAuthenticated,async (req, res)=>{
        let missField = lib_common.checkMissParams(res, req.body, ["OWNER_ADDRESS_ERC20", "PRIVATE_KEY_ERC20","OWNER_ADDRESS_TRC20","PRIVATE_KEY_TRC20","INTEREST_RATE"])
        if (missField){
            console.log("Miss param at Create Field");
            return;
        }
        const a1 = req.body.OWNER_ADDRESS_ERC20
        const p1 = req.body.PRIVATE_KEY_ERC20
        const a2 = req.body.OWNER_ADDRESS_TRC20
        const p2 = req.body.PRIVATE_KEY_TRC20
        const i_r = req.body.INTEREST_RATE
        changeConfig(a1, p1, a2, p2, i_r)
        return response_express.success(res, 'thanh cong')
    })
    const saveNote = (note)=>{
        const data = JSON.stringify(note)
        //sai path
        fs.writeFileSync('configuration.json', data)
    }
    
    const loadNote = ()=>{
        try{
            //sai path
            const dataJson = fs.readFileSync('configuration.json').toString()
            const data = JSON.parse(dataJson)
            return data
        }catch(e){
            return {}
        }
    }
    const changeConfig = (addr_erc20, prv_erc20, addr_trc20, prv_trc20, i_rate)=>{
        var notes = loadNote()
        notes = {"OWNER_ADDRESS_ERC20": addr_erc20, "PRIVATE_KEY_ERC20": prv_erc20,"OWNER_ADDRESS_TRC20": addr_trc20,"PRIVATE_KEY_TRC20": prv_trc20,"INTEREST_RATE": i_rate}   
        saveNote(notes)
    }
}
