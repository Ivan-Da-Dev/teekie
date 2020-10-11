/* Discord */
const Discord = require("discord.js")
const client = new Discord.Client()

/* Config */
const config = require("./config.json")

/* File Writing */
const fs = require("fs")

/* NPM */
const ms = require("ms")

/* Change the prefix if you want */
const PREFIX = "teekie "

client.on("ready", function(){
    const date = new Date()
    console.log(`[${date}] ✅ Logged in as ${client.user.username}`)

    client.user.setActivity({
        name: `Teekie x Stomcie | ${PREFIX}help`,
        type: "LISTENING"
    })

    /*
    Change the status if you want

    online = online status
    dnd = do not disturb
    idle = idle

    invisible dosen't work i think
    */
    client.user.setStatus("dnd")
})

client.on("message", async message => {
    if(message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(PREFIX)) return;
    let args = message.content.substring(PREFIX.length).split(/ +/);
    const command = args[0].toLowerCase()

    let mentionMem = message.mentions.members.first()
    let mentionUser = message.mentions.users.first()

    let member = message.member
    let user = message.author

    let reason = message.content.slice(`${PREFIX}${command} ${mentionMem} `.length)

    function send(msg){
        message.channel.send(msg)
    }

    function noPerm(permission){
        message.channel.send(`**Ay senpai** you need \`${permission}\` to execute this command`)
    }

    function error(err){
        message.channel.send(`**ERROR** ${err}`)
    }

    function success(msg){
        message.channel.send(`**SUCCESS** ${msg}`)
    }


    if(command === "help"){
    const help = new Discord.MessageEmbed()
    .addField("__Kick__","Kicks a member from the server\n`Kick Members`",true)
    .addField("__Ban__","Bans a member from the server\n`Ban Members`",true)
    .addField("__Eval__","Runs javascript code",true)

    .addField("__Mute__","Mutes a member\n`Kick Members` `Ban Members`",true)
    .addField("__Unmute__","Unmutes a member\n`Kick Members` `Ban Members`",true)
    .addField("__Unban__","Unbans a member",true)
    message.channel.send(user,{embed: help})
    }

    if(command === "eval"){
        if(config.whitelisted.some(user.id) === false) return send("You need to be whitelisted to use this command")
        send(
            "```js\n"+
            eval(message.content.slice(`${PREFIX}eval `.length))+
            "```"
            )
    }

    if(command === "kick"){
        if(member.hasPermission(["KICK_MEMBERS"])) return noPerm("Kick Members")
        if(!mentionMem) return error("Ay senpai you need to mention someone")
        if(mentionUser.id === user.id) return error(";-; you can't kick yourself")
        if(mentionUser.id === message.guild.owner.user.id) error("YOU CAN'T KICK MY SENPAI")
        if(mentionMem.kickable === false) return error(`I'm not good enough to kick ${mentionMem}`)

        if(!args[3]) return error("Ay senpai you need to give me a reason")

        try {
            mentionMem.kick(reason)
            return success(`\`${mentionUser.tag}\` was kicked`)
        } catch (err) {
            error(err)
        }
    }

    if(command === "ban"){
        if(member.hasPermission(["BAN_MEMBERS"])) return noPerm("Ban Members")
        if(!mentionMem) return error("Ay senpai you need to mention someone")
        if(mentionUser.id === user.id) return error(";-; you can't ban yourself")
        if(mentionUser.id === message.guild.owner.user.id) error("YOU CAN'T BAN MY SENPAI")
        if(mentionMem.bannable === false) return error(`Ay senpai sorry but I can't ban ${mentionMem}`)

        if(!args[3]) return error("Ay senpai you need to give me a reason")

        try {
            mentionMem.ban(reason)
            return success(`\`${mentionUser}\` was banned`)
        } catch (err) {
            error(err)
        }
    }

    if(command === "mute"){
        if(!member.hasPermission(["KICK_MEMBERS"]) || !member.hasPermission(["BAN_MEMBERS"])) return noPerm("Kick or Ban members")
        if(!mentionMem) return error("Ay senpai you need to mention a member")
        if(mentionUser.id === user.id) return error(";-; you can't mute yourself")
        if(mentionUser.id === message.guild.owner.user.id) error("YOU CAN'T MUTE MY SENPAI")

        if(!arg[3]) return error("Give me a reason senpai")

        let rolePOSITION = message.guild.me.roles.highest.comparePositionTo(mentionMem.roles.highest);
        let rolePOSITION2 = Math.sign(rolePOSITION)

        if (rolePOSITION === 0) return error(`I need to have a higher role than ${mentionMem}`)
        if (rolePOSITION2 === -1) return error(`I need to have a higher role than ${mentionMem}`)


        try {
            let muteRole = message.guild.roles.cache.get("764816347112669196")
            if(!muteRole) return error("Theres no mute role senpai")
            if(mentionMem.roles.cache.has(muteRole)) return send(`Ay senpai...did u forgot? ${mentionMem} is already muted`)

            mentionMem.roles.add(muteRole.id)
            if(mentionMem.hasPermission(["ADMINISTRATOR"])) return send(`**NOTE** ${mentionMem} has \`Administrator\` permission`)
        } catch (err) {
            console.log(err)
            error(`Can't mute ${mentionMem} senpai`)
        }
    }

    if(command === "unmute"){
        if(!member.hasPermission(["KICK_MEMBERS"]) || !member.hasPermission(["BAN_MEMBERS"])) return noPerm("Kick or Ban members")
        if(!mentionMem) return error("Ay senpai you need to mention a member")

        if(!arg[3]) return error("Give me a reason senpai")

        let rolePOSITION = message.guild.me.roles.highest.comparePositionTo(mentionMem.roles.highest);
        let rolePOSITION2 = Math.sign(rolePOSITION)

        if (rolePOSITION === 0) return error(`I need to have a higher role than ${mentionMem}`)
        if (rolePOSITION2 === -1) return error(`I need to have a higher role than ${mentionMem}`)

        try {
            let muteRole = message.guild.roles.cache.get("764816347112669196")
            if(!muteRole) return error("Theres no mute role senpai")
            if(!mentionMem.roles.cache.has(muteRole)) return send(`Ay senpai...${mentionMem} is not muted`)

            mentionMem.roles.remove(muteRole.id)
        } catch (err) {
            console.log(err)
            error(`Can't unmute ${mentionMem} senpai`)
        }
    }

    if(command === "unban"){
        if(member.hasPermission(["BAN_MEMBERS"])) return noPerm("Ban Members")
        if(!Number(args[1])) return error("Ay senpai you need to give me a id")
        if(mentionUser.id === user.id) return error(";-; you can't ban yourself")
        if(mentionUser.id === message.guild.owner.user.id) error("YOU CAN'T BAN MY SENPAI")
        if(mentionMem.bannable === false) return error(`Ay senpai sorry but I can't ban ${mentionMem}`)

        if(!args[3]) return error("Ay senpai you need to give me a reason")

        try {
            let fetch = message.guild.fetchBan(Number(args[1]))
            message.guild.members.unban(Number(args[1]))
            return success(`\`${(await fetch).user.tag}\` was unbanned`)
        } catch (err) {
            console.log(err)
            error("Couldn't find that user")
        }
    }
})

client.login(config.token)