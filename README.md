# CEX.io bot 

> use at your own risk, I tell you this because I risked and lost some money. 
> I started my journey in BTC trading with 160€, I almost doubled its value up to 390€ and then back to now, 99€ ... 
> I don't think you should be putting real money or effort on this, BTC is just vapor for now... 
> But this hasn't stopped me to develop my own bot that auto-trades bitcoin based on [Volume-weighted average price](https://en.wikipedia.org/wiki/Volume-weighted_average_price) technique.
> 

So basically what's in here? A single massive bot that buys 20€ of bitcoins every day, and when you've converted all your euros in BTC, he sells everything. 

I do cover some edge cases I found during development. 

The bot is designed to work every 24 hours, open an issue if you want it to adapt...

> this is not a showcase project... you'll find the ugliest code ever written by me... I just had to close my relationship with BTC by building a bot and not thinking anymore to them 

## install

```
$ npm i
```

## Configure

create a file .env and set these variables: 

```env
CEX_API_KEY=
CEX_API_SECRET=
CEX_CLIENT_ID=
```

## Start 
```
$ npm start 
```

## To run on Heroku: 

1. install addon Heroku Scheduler and set it to run every 24 hours 
2. set your .env variables in heroku too (the .env file is in gitignore so it's not committed)

