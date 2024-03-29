const path = require('path')
const nodemailer = require("nodemailer");
const fetch = require('node-fetch')

const VARIABLE = require(path.join(__dirname, '../variable'))
const response_express = require(VARIABLE.LIBS_DIR + '/responses').response_express
const validator = require('validator');
const { Types } = require('mongoose');
const Balances = require(VARIABLE.MODELS_DIR + '/Balances');
const User = require(VARIABLE.MODELS_DIR + '/Users')
const Invest = require(VARIABLE.MODELS_DIR + '/Invests')
const UserCode = require(VARIABLE.MODELS_DIR + '/userCode');
const Auth = require(VARIABLE.AUTH_DIR + '/auth')

module.exports = (router)=>{
    router.post('/create-register-code',async (req, res)=>{
        try
        {
            var { email} = req.body;
            
            if(email === null || email === undefined || email.trim().length === 0,!validator.isEmail(email)) {
                return response_express.exception(res, 'Email is not suitable!')
            }

            email = email.toLowerCase()

            var findUser = await Users.findOne({ email: email });
            if(findUser) {
                return response_express.exception(res, 'email is registed!')
            }

            var register_code = getRandomInt(100000, 999999); //shordid.generate();

            var find_user_code = await UserCode.findOne({ email: email });
            if(!find_user_code) {
                let new_doc = await UserCode.create({
                    email: email,
                    code: register_code,
                    types: 1
                });
                delete new_doc.code

                send_email(email, "Register User", register_code.toString());

                return response_express.success(res, new_doc)
            } else {
                return response_express.exception(res, 'you wait 2 minute to resend code')
            }            
        }
        catch(er){
            return response_express.exception(res, '')
        }
    })

    router.post(`/create_forgot_password_code`, async (req, res) => {
        var { email } = req.body;

        if(email === null || email.trim().length === 0) {
            return response_express.exception(res, 'no email request')
        }

        email = email.toLowerCase()


        var find_user_code = await UserCode.findOne({ email: email });
        var find_user = await Users.findOne({ email: email });

        if(!find_user){
            return response_express.exception(res, 'email is not register!')
        }

        var forgot_password_code = getRandomInt(100000, 999999); //shordid.generate();

        if(!find_user_code) {
            var new_doc = await UserCode.create({
                email: email,
                code: forgot_password_code,
                types: 2
            });

            var new_doc = {...new_doc}
            console.log(new_doc);
            delete new_doc.code
            console.log(new_doc);

            send_email(email, "Forgot password", forgot_password_code.toString());

            return response_express.success(res,'ok')
        } else {
            return response_express.exception(res, 'you wait 2 minute to resend code')
        }
    });

    router.get(`/get_asset_total_user`, Auth.expressMiddleware, async (req, res) => {
        const id = req.token_info._id
        var totalAsset = 0
        var totalProfit = 0
        var totalInvest = 0
        var rewardPoint = 0

        var rateEther
        var rateTrx
        var rateUSDTTrx
        try
        {
            const user = await User.findById(id)
            const balanceETH = await Balances.findOne({user:user._id, coins:Types.ObjectId('5fa8ac7b2c89c5229459f9fc')})
            const balanceTrx = await Balances.findOne({user:Types.ObjectId(id), coins:Types.ObjectId('5fa8ac7b2c89c5229459f9f6')})
            const balanceUsdtTrx = await Balances.findOne({user:Types.ObjectId(id), coins:Types.ObjectId('5fa8ac7b2c89c5229459f9f8')})
            var invests = await Invest.find({user: user._id})
            var linkTrx = "https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd";
            var data = await fetch(linkTrx);
            data = await data.json();
            rateTrx = data.tron.usd

            var linkEth = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
            var data = await fetch(linkEth);
            data = await data.json();
            rateEther = data.ethereum.usd
            
            var linkTether = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd";
            var data = await fetch(linkTether);
            data = await data.json();
            rateUSDTTrx = data.tether.usd
            
            totalAsset = (balanceETH.balance*rateEther + balanceTrx.balance*rateTrx + balanceUsdtTrx.balance*rateUSDTTrx + user.reinvest_balance).toFixed(2)
            totalProfit = (user.reinvest_balance).toFixed(2)
            for (let index = 0; index < invests.length; index++) {
                totalInvest = totalInvest + invests[index].value
            }
            totalInvest.toFixed(2)
            rewardPoint = (user.points).toFixed(2)

            return response_express.success(res,{
                totalAsset: totalAsset,
                totalProfit: totalProfit,
                totalInvest: totalInvest,
                rewardPoint: rewardPoint
            })
        }
        catch(er){
            return response_express.exception(res,er)
        }
    });

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }   




    async function send_email(toAddress, subject, textBody) {
        // console.log("send_email")
        // console.log(toAddress + "," + subject + "," + textBody)

            // let transporter = nodemailer.createTransport({
            //     host: "pro200.emailserver.vn",
            //     port: 587,// 465, 25
            //     secure: false,
            //     auth: {
            //         user: "no-reply@kingdomgame.org",// "kdg@kingdomgame.org", // generated ethereal user
            //         pass: "aUwU1nrRjdxe", //"l])4]$7OK,rn", //"aUwU1nrRjdxe",
            //     },
            // });

            // var SESCREDENTIALS = {
            //   accessKeyId : "AKIAWUANJ6CALZVDDQOK" ,
            //   secretAccessKey : "BMckeXJ1UKZyyd0W582RG9Hrjy57RERca0VmhU/Y+cV7"
            // };
        
            // var transporter = nodemailer.createTransport(sesTransport({
            //     accessKeyId: SESCREDENTIALS.accessKeyId,
            //     secretAccessKey: SESCREDENTIALS.secretAccessKey,
            //     rateLimit: 5
            // }));
        
        
        
            //   var mailOptions = {
            //       port: 25,
            //       from: 'FromName <registeredMail@xxx.com>',
            //       to: toAddress, // 'registeredMail@xyz.com', // list of receivers
            //       subject: 'Amazon SES Template TesT', // Subject line
            //       html: "Mail message" // html body
            //   };
        
            //   // send mail with defined transport object
            //   transporter.sendMail(mailOptions, function(error, info){
            //       if(error){
            //           console.log(error);
            //       }else{
            //           console.log('Message sent: ' + info);
            //       }
            //   });

            // //  return;

            let transporter = nodemailer.createTransport({
               // host: "mail.name.com", //"smtp.gmail.com", // "pro200.emailserver.vn", //"smtp.gmail.com", //"", //"pro200.emailserver.vn",
                host: "smtp.gmail.com", //"email-smtp.ap-south-1.amazonaws.com",
                // host: "pro200.emailserver.vn", //"pro200.emailserver.vn", //"smtp.gmail.com",
                port: 465, //465,// 465, //587,
                secure: true, //false, // true for 465, false for other ports
                auth: {
                    user: "kingdomgame40vn@gmail.com", // "AKIAWUANJ6CALZVDDQOK", //"redtigeriot@gmail.com",// "no-reply@kingdomgame.org", //"verify@kingdomgame.co", //"no-reply@kingdomgame.org", // "", // generated ethereal user
                    pass: "kdg@123321",  //"BMckeXJ1UKZyyd0W582RG9Hrjy57RERca0VmhU/Y+cV7", //"thienmai890897",// "aUwU1nrRjdxe", //"Kdg@tothemon5$", //"", //"aUwU1nrRjdxe", // generated ethereal password
                    // user: "redtigeriot@gmail.com", // generated ethereal user
                    // pass: "thienmai890897", // generated ethereal password
                },
            });

            let info = await transporter.sendMail({
                from: "kingdomgame40vn@gmail.com", //"redtigeriot@gmail.com", // "verify@kingdomgame.co", //"no-reply@kingdomgame.org",// "no-reply@kingdomgame.org", //"kdg@kingdomgame.org", //"no-reply@kingdomgame.org",
                to: toAddress,
                subject: subject,
                text: "Your code is:" + textBody,
                ///html: "Hi! Your code is:" + '<b style="padding: 0 50px;padding-top: 30px;color: blue; font-size: 50px; color: #fac800">' + textBody + '</b>',
             //   html: textBody,
                html: `
                <table
                style="width: 100%; border-radius: 10px; overflow: hidden; background-color: #fff;font-family: Microsoft Yahei,Arial,Helvetica,sans-serif;"
                >
                    <tr>
                        <td colspan="3" style="background-color: #121827; text-align: center; padding: 12px 0;border-top-left-radius: 10px; border-top-right-radius: 10px;">
                            <a href="{domain_name}">
                                <img src="cid:logo@nodemailer.com">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style=" padding: 0 50px;padding-top: 30px;">Hello,</td>
                    </tr>
                    <tr>
                        <td style="padding: 0 50px;padding-top: 15px;" colspan="3">Your code is:</td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 37px 50px; font-size: 30px; color: #fac800; font-weight: bold;" colspan="3">` + textBody + `</td>
                    </tr>
                    <tr>
                        <td style="padding: 0 50px;" colspan="3">
                            This code remains valid for 10 minutes. Please do not disclose it to anyone (including KDG staff)
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 50px;"></td>
                        <td style="border-bottom: 1px solid #ddd9d8; padding-top: 16px;">
                        </td>
                        <td style="width: 50px;"></td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: center; padding-top: 11px;">
                            <a style="padding: 0 13px;" href="https://www.facebook.com/KingdomGameGlobal"><img style="width: 33px; height: 33px;" src="cid:fb@nodemailer.com" /></a>
                            <a style="padding: 0 13px;" href="https://twitter.com/KingdomGame_KDG"><img style="width: 33px; height: 33px;" src="cid:twitter@nodemailer.com"/></a>
                            <a style="padding: 0 13px;" href="https://t.me/kdg_ann"><img style="width: 33px; height: 33px;"  src="cid:telegram@nodemailer.com"></a>
                            <a style="padding: 0 13px;" href="https://medium.com/kingdom-game-4-0"><img style="width: 33px; height: 33px;" src="cid:medium@nodemailer.com"></a>
                            <a style="padding: 0 13px;" href="https://www.youtube.com/channel/UCl7ezf4kJUxjlPJwaoPtapA/featured"><img style="width: 33px; height: 33px;"  src="cid:youtube@nodemailer.com"></a>
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 50px;"></td>
                        <td style="padding-top: 10px; text-align: center;">Kingdom Game 4.0 Team!</td>
                        <td style="width: 50px;"></td>
                    </tr>
                    <tr>
                        <td style="width: 50px;"></td>
                        <td style="text-align: center"><a href="{domain_name}">` + `https://kingdomgame.org` + `</a></td>
                        <td style="width: 50px;"></td>
                    </tr>
                </table>
                `,
                attachments: [
                  {
                    filename: `logo.png`,
                    content: 'iVBORw0KGgoAAAANSUhEUgAAAE4AAAA0CAYAAAAkEw66AAAACXBIWXMAAAsTAAALEwEAmpwYAAA4KGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzIgNzkuMTU5Mjg0LCAyMDE2LzA0LzE5LTEzOjEzOjQwICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNS41IChXaW5kb3dzKTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAyMC0wOC0xNVQwODozODo1NiswNzowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDIwLTA4LTE1VDA4OjUwOjQwKzA3OjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpNZXRhZGF0YURhdGU+MjAyMC0wOC0xNVQwODo1MDo0MCswNzowMDwveG1wOk1ldGFkYXRhRGF0ZT4KICAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9wbmc8L2RjOmZvcm1hdD4KICAgICAgICAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDo5OTkzMDkzMy1iNzEyLTk3NDMtYmFkYi02YTZjNjU1YjBiNzc8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6OTk5MzA5MzMtYjcxMi05NzQzLWJhZGItNmE2YzY1NWIwYjc3PC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6OTk5MzA5MzMtYjcxMi05NzQzLWJhZGItNmE2YzY1NWIwYjc3PC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjk5OTMwOTMzLWI3MTItOTc0My1iYWRiLTZhNmM2NTViMGI3Nzwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAyMC0wOC0xNVQwODozODo1NiswNzowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjc4PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjUyPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAg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"/',
                    encoding: 'base64',
                    cid: 'logo@nodemailer.com'
                  },
                  {
                    filename: `fb.png`,
                    content: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEwElEQVRogdWaW2gcVRjHfzN7kjTmYk3SqJUWLC2t+lCbRhuhFCKiPog+KFQbKwiiKAYUA4KWPlS8YB8MFCwVNahtRRAt+tAHxTy0kFZtrYJtLmq9JbJpqtikuzszZ2Z9ODPJzu5ms7NzcvEPy+455zvfZeacs9/lGGP996MBrUAn0AFsAK4HVgB1/vhl4AJwHhgETgD9wHhcwcI0E5XObQYeAXYAmwGjBG0N0ASsB+72+7LAKeAw8D5wsRIljOSxHVHnXAv0AE8w84TjIgW8C7wKjEWZaIwf31kurQCeBXYD9VGERMAUsAfoBZxyJhgXBh4th24d8BGwqWLVouEM0AWcnYtQmGbVXDT3odZoY3y9ysbNwElgJ3CkFKFAVJcafxx4E6h4p8dAPfAx8BTw1mxEgsSsBjyJUn4xkQAO+N/7ixEIEjXF+u8F9s2fXpGxDxgFPssfKPYGbgAOsTjLZjYkUDrdCpzLHRAkQpu4CviQ+Tsm46Aepdst5ByxAkPkEj0DbFxYvSJhI+q/6PWgw7g4vDf4vRIYYmk+/VxMoVySMQAzZ+AFlr7yoHR8MWgEb6AF+B2o1S3NdT0GvvmD4Z8nsGxJfV0Na9c0c1v7qjhs08BqYCLYAA8zD8qP/nWJp5//nF9+/TvU37l1TVwDalE69wrPc/EbWpHNQs/uowXKq7Esvtw46AJ6hStlK9AWl1s+fvgxydmhcLzS2FBD3RVVXHVlDa6UcUVsBlYKKa3bKR2MVITBkWSo3f1YO10P3DTdltKKK8IAOoW0rS1xORVDJhNWsKOtFWnHVjof7cKxMxt0cwUKloiJxLEzusWsF46dXqubK4DrhgMq6WRwbO0rdZ1x5mjXJaBBB7cvjyfpfWd4Trpd3TfS0dasQ+SkcKyUFuUBXGmXRdfUmMWxUjpENgg7c1kHIwCkU94mXV4v0STXFo6VmkTTErqmKctdWxWr30ZtBs/PGLStvY7aZSbCNKg2Lcq0dS5MCttKJdFkwKpW2H6nivC+GPBCBtyzrZqW5SpGsvUsH4B/hGOlfgK0n0T5x6i0MziW9lNoRDh2apCZdJ82uHmujmOnccrb41EwJKSdPqmdLeBJgYpQFVwng7SzusWcEq60+lGJVq3v1/MgZIBr40pPp4gs8JVwpZUETqO8O23wvHBSw5M2roztQufiNDAmPPWXfxDNBmTz/H3PlXhubBc6F4cBBFkPlAGvoDUqy1/vHr4sHUij8rUEIeUE0IfKQ2rB6hU2d2z6d7q9rFrr+u9D6YxxcDq+/5+mVUxUbsWEMRP25LSX6uclX1dMQJjhw7MXeIiFK2RExXfAG7kdImGGCBxgO/AtC1vQKAeTwIPklZ5EojAHPYKqjHzC0slQu6jUT0G0VMwAUHn4bha/wBGgmyK1AQAhZn/G+1GWL1aJCV9+6RJTQsw2BP7EceA9Fn5PTKEK6Z+WIir1BgIcAdpZ2DLr96gbAHOXWUXpNxBgBHUPogfYxTwkgn2kgZeBvUBZ0YNxLPo2vQ54DlWC1XnVoA94DfgzykRj4EDFQltQx20XKjkcNZ7IolziQ8AH+L5NVBhfv13JtAJcjbpuswVV5Qyu2wR+1RQz123Ooarw/UCygFNE/AfU3HAtF4928AAAAABJRU5ErkJggg==',
                    encoding: 'base64',
                    cid: 'fb@nodemailer.com'
                  },
                  {
                    filename: `twitter.png`,
                    content: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFkklEQVRogdWaa2wUVRTHf7N7t+/WvihFKFAoFCgkCPJWokiiH8A3IlrxBUFIUInwyfCSxMQQQGOEAppo4wNihAQ/aMQoKEJFoIg8pJi0BCqVLqW0u9udmZ1dP9xduqW7253Z0pZ/Mh9m7jnn/s/cx7lzzigNB5+hG1AAPAhMBUYBxUA/ID3Y7gYagVrgHFAFHACuJtqxUBS7Vd1c4EXgOWAioMSQTQ7KlwKPBJ8FgOPAl8CnwHUrJJSrh8rN6hQCq4AltL/hROEGtgMbgQYzikrj4ZfilRXACmANkGGmExNwAeuB9wFfXKQUuyMeuRHALmCCZWrxIQM5Cs8CC4ALXSkIxZ7Ulcxc4HMgK1F2JjAROAaUA9/GEhTEduBV5Ny0vNITQBawF7nWPokmFMuBJcA2Yu8utxt2YGeQw8eRBKI58CjwEb1LPgQFqEDGjH23NkZyYDRyzvfGtIkGO5LTZODv8AaBTXS8hy+AzB6jFj8ykdymELbFCsn5Jt4E7ulZXqYwAXgd2Bx6YAtrLATW9jQjC1iH5Ap0dOAtbl+E7U5kIk8EQLsDOcBrvULHGpYB2QAiEAiADNt3wtsPIQN53KgQhuEDeMGqJZdbIyO9y+MIx07Ws6PyOOcvOElNcTBjShHLXplMbk4aR09cJi8njZJhuWa6XghUKP+eWpePDBKmg1YgAPMXfcOalfczdnRBVLn9B2tZ/e4B/HK0byInOwVFUSjIS2PnljkkJ5sKPX6gv/Dp6iwr5AGcTW3UXbrB0lXf8faKacyeOaSTjK772fjh4U7kAa43e7HZFEqKs/lqzynKnx5jpnsb8IDQNe9UK+QB7IqMJ6pmsOa9Q/x4sJbF5WUMHtgeB8/WNNHcoka14fcHKBqQzrw5xeia1yyFaULXvKUWuAOQ7IDxZXmcPHMNgF+q6vn193rGl+UxY1Iho0qyaWqOTh4gPU2wdGEphk/FME9hpNDVthFWyAO43D6eeHgQdZdaaW7RALkuqk9fo/r0tbhspCTb0dU2qxRGCk315FvV9np9rN38J3ab9UNr//wkNNVjVT1f6KrnLqvaqQ4YNzKDv2pcVk1QWpyKbt2BTKGpbsudAyyal8uGrV6c1+P6Bu+ECWOSSISD0FVPC8GwbAXZ6fDy41l8/UMrdfW6Kd3hRQ4GFxiJjIBL6KrHSQIOADibNNPkAZ56KCkR8gBOoaueOqAkESuTR0P9fzb2V/npHK4iY9a9NooLNXRVS6TrWuHT2s4AsxOxAjB3OkwqVfi+ysbx87F3pbHDAjx2n4YvIe4AnBM+3XsEeCMRK4YfLjbYqTrjoLomNvnpY3WenKniN8BvIXLdgt+E4VN/QiZaTW/mZy8msf+PVK402fEZsdX75xjMne5m1GAdAmBY27TCEQB+FoZPawSOIj+WTaF0oMbwQjdnLyZz/lIKlxsdtLbZ0H0KDhEgL8ugqECjbIiXYXdrKHQL8RCqAKcI+HWASisOANgVGDdUY9zQ1tiCfuJe4HGiEto/KXchM8N3ClzAbmh3oAnY0Wt0zKOCYEHEpiBXrwIbFXCF3ffVy6XAptB9uAMNCrzTBwh2da0PckUBhD08MyQrIwvou9m5E8AH4Q+EraMDOjJdcYy+lx9tQXLrcOgSonMioAZZGdlD38lQG8jUT6eSk7BHprgPWA5sva204sdyItQGIPIIhLAN6flWem8kDGQaMeoWL+wiWhMEFRuRUa+nU4+tyEL63lhCsUYghL3IvPxuem53qgbmE0+ZVcQegRAuIP+DWAGspvsq9LfCDWwAtgBxfS0oh8wv00HASmAxkGZaOzI8yOm6CbhsRlE5st1yp/2QGeLnsT61qpF1r88ApxUDytGI1VfTGEDH321KkImCUM7pBtAM/IOsMh5B/m5zJdGO/wcpt58ipt/w9QAAAABJRU5ErkJggg==',
                    encoding: 'base64',
                    cid: 'twitter@nodemailer.com'
                  },
                  {
                    filename: `telegram.png`,
                    content: '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',
                    encoding: 'base64',
                    cid: 'telegram@nodemailer.com'
                  },
                  {
                    filename: `medium.png`,
                    content: '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',
                    encoding: 'base64',
                    cid: 'medium@nodemailer.com'
                  },
                  {
                    filename: `youtube.png`,
                    content: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFg0lEQVRogdWabWxTVRjHf7c93dp1A2FM2HxJRBBd5gyRJRA0AeIHP+E3XwDfPgjRBCOJmojBD2o0MUSMEMiIL5GgSAgRjTHBGIgLGTLAaWDgG4qwTbaOja3rvb1vvX44LVtn157bFTb/SbPenv9zn/+z8/6co136/mFKgBuB5cBi4E7gNqAGiKbLE0AM+As4CxwDDgO9E3UsNC1YrG018ASwCrgX0PJwy4GZwALgwfRvHnAS+AzYBVwuRoTWe2SNX5s6YCPwNFBRjNMc0IGPgLeBbj+GWqz1KVVuCHgBeA2o9OPEB4aB14H3AFvFQOs79owKbz6wF1hYtDR/aAceAX4vRBRasKwQ5yFkG502cV3KWAicQPaxL/MRBfkDWAtsB4ru6RPANGA/8BywczxSvgCeRYqfTASB5vTfHbkI4wWwEth67XT5xlagC/hqbEGuAOqRY/NkNJvxEERqakJOhFchCIjRzyFgDyMz6FRCFPgcWMSoIVZAVgAbgMbrq8sXGpEa38n8EBhVeBOw6XorKgKbgNrMw+gAXuTazbClRCXwUuYhE8As5Jj/f8E65GIS4XkewKP4XJglEhbftZzjz/P99MYSGKZNfNjCMGwcNwWAoY98FyJAJBICoCwUJBIOEY2GqIqWM6u6gvlzq1l+/1wi4ZCK+wrgMWCbcF0H5JStjM7uIdZu+JKeWMKPWUHUzali55aV1M6uUqE/DmwLuI5V5zpWk+tYqH42bztScvEA3ZfibNnRqqqjyXWsOuHY5gq/jk7+/E/JxWdwvL0LxzZVqBqwQthWssmPg77+JLqhtFQvCkNxi97YIDOml6vQFwnbSt7hx0FP76ASb2nTHDzPo/VEj5/XAxCLDVEZUeoHC4RtGr4CuHJlWIlXMzPEutXz+amjjuZPf+N8p3qf6e+Pc/NsUZgI84Rl6nOU3wzE47oSz3VsLFOnfl45725q4NuWXnYfuMhwwiloq+sGlqnUhGqFbeq+xn/XsZR4KdfBNkeCfWBJFUvuWcCH+7ppOT6Q19Ywklm2eRAVlplwGLOiywfHTirxXNfGMkeajeN6HGwZ5Pipwn3IdZJYptJq3ha2qceBGUqqgJSrNMRl1UD72SR7vonTc7lw8wEoC9iqNRAXtqn34yOA8qCaiJTr8HdnnL0Hk3ScU7PJQMPENpVsBoRt6heA21VfHhaeEu/kGYtDbSYpNXq2j2AS28yX6LuKC8KxjA5kXlMJVWHQEBTSNRAvQjkQ0GBaOIniWNEhHDvZ5sdBEKieXkHfYKAgtxjUzEjhpZI4KSV6m3Ad87BfJ4vrA3x9tFRp0THvvsvAddQGCuCQcB2rE5kFW6RqdV+DheO4tHZUMKSXJnlRGUmxtCHBkvphXLU+fwLoEl7KBpk6VA4AYFnjAMsaB9DNAMNGEMMMYDkalqORtEaal+dpgIc2qk+WhzzKRIqykEekLEVlxCUaTreZFAX7Vxq7ALTdrwJyS3kBiPgJYhJhALcCfZl/VR958o9TEM1IzQQ05M5Ag80a6KOep+onkdaKNiaATg3emAICC33e1KDr6vPe7FRWCPgRaBi/9iYVp5DncSOpxUD2fGQjUyxtlO78q1TQkdqy9rNC/HcY7wDWAPuYOhlqF1gNnBlbIIK5JX4BrGfyDzgyWA8cyFWQqwYy2IHsJ+8zeTXhAs8zzukMgAjm34ttB3qQs9717hMJ4EnkOdm4yFcDGewHfkWekNxdCmUKOIW8AXC6EFEItd3waeRaaSPwMtduyWEgDy/eApR2BNoR/930FuAV5FWDsG/r3EgCHyOvGlz0Y6gdbS7aaQ2yja6i+BP8dmTT/AR5m8U3tLYPinSdjVqyr9vMA24ApqfLB4ErwB/AL8APyOs2E84S/wt9XQ/EN38rsQAAAABJRU5ErkJggg==',
                    encoding: 'base64',
                    cid: 'youtube@nodemailer.com'
                  },
               ], //"<b>Hello world?</b>", // html body
            });

            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
}