import cron from "cron"
import https from "https"

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(process.env.API_URI, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully")
      else console.log("GET request filed", e)
    })
})

export default job