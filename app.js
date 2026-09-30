const {Telegraf} = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

let currentChatters = [];

// bot.help((ctx) => ctx.reply('Send me a sticker'))
// bot.on('sticker', (ctx) => ctx.reply('👍'))
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))
// bot.command('oldschool', (ctx) => ctx.reply('Hello'))
// bot.command('hipster', Telegraf.reply('λ'))

bot.start( async (ctx) => {
    await ctx.replyWithPhoto(
        {source: './start.png'},
        {
            caption: `Hi ${ctx.from.first_name} 👋.\n\nWhat if the next random person you meet in CU becomes someone you actually like talking to? 👀 \n\nThere's only one way to find out...😚`,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '💬 Start Chatting',
                            callback_data: 'start_chat'
                        }
                    ]
                ]
            }
        }
    );
});

bot.action('start_chat', async (ctx) => {
    await ctx.answerCbQuery();
    if (currentChatters.length === 0){
        currentChatters.push({
            chatter: ctx.from, time_joined: Date.now()
        });
        await ctx.reply(`Hey ${ctx.from.first_name}, wait a moment, someone is coming 😊...`);
        return;
    }

    const randomChatter = currentChatters.pop().chatter;

    const linkOfRandomChatter = randomChatter.username 
        ? `t.me/${randomChatter.username}` 
        : `tg://user?id=${randomChatter.id}`;

    const linkofCurrentChatter = ctx.from.username 
        ? `t.me/${ctx.from.username}` 
        : `tg://user?id=${ctx.from.id}`;

    await ctx.reply(
        `Nice, you've been paired with <a href="${linkOfRandomChatter}">${randomChatter.first_name}</a> 😉 \nGo ahead, click the name, text them 👍`, 
        {parse_mode: 'HTML'});

    await ctx.telegram.sendMessage(
        randomChatter.id,
        `Nice, you've been paired with <a href="${linkofCurrentChatter}">${ctx.from.first_name}</a> 😉 \nGo ahead, click the name, text them 👍`, 
        {parse_mode: 'HTML'}
    );
})


if (process.env.BOT_MODE == 'webhook'){
    bot.launch({
        webhook: {
            domain: process.env.WEBHOOK_DOMAIN,
            port: process.env.PORT
        }
    })
    console.log("🤖 Running with webhook");
}
else {
    bot.launch();
    console.log("🤖 Running with polling");
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))