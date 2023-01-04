import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { Database } from "bun:sqlite";
import { eachWorkingDayOfInterval, addWorkingDays, isWorkingDay, getWorkingDate } from './src/index.ts'
import * as holidaysjson from './holidays.json'


import {
  Content,
  RequestList,
  Home
} from './html'

const db = new Database("mydb.sqlite");
db.run("CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, method TEXT, created DATETIME DEFAULT CURRENT_TIMESTAMP)")

const app = new Hono()

// middleware

app.use('*', prettyJSON())

app.use('*', async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  console.log(JSON.stringify(c.req.url))
  
  db.run("INSERT INTO requests (method, url) VALUES (?, ?)", c.req.method, c.req.url)
  await next()
})

function getholidays(): array {
  return holidaysjson.default.map(d => new Date(d))
  }


// routes 

app.get('/', (c) => {
  const start = new Date('2022-09-29')
  const end = new Date('2022-10-31')
  const holidays = getholidays()
  
  return c.json({

   /* eachHolidayOfInterval: eachHolidayOfInterval({
      start: start,
      end: end
    }, holidays), */
    
    eachWorkingDayOfInterval: eachWorkingDayOfInterval({
      start: start,
      end: end
    }, holidays), 

    addWorkingDays: addWorkingDays(start, 5, holidays),

    isWorkingDay: isWorkingDay(new Date('2022-10-24'), holidays),
    getWorkingDate: getWorkingDate(start, 5, holidays),
    
  })
})

app.get('/requests', (c) => {
  const latestRequests = (db.query("SELECT * FROM requests ORDER BY id DESC").all())
  const props = {
    requests: latestRequests,
    siteData: {
      title: 'all requests',
    },
  }
  return c.html(<RequestList {...props} />)
})


app.get('/requests/:id', (c) => {
  const id = c.req.param('id')
  const request = (db.query("SELECT * FROM requests WHERE id = ?").get(id))
  const props = {
    request: request,
    siteData: {
      title: 'request by id',
    },
  }
  return c.html(<Content {...props} />)
})

export default {
  port: 3000,
  fetch: app.fetch,
}
    
