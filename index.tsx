import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { Database } from "bun:sqlite";
import * as dayjs from 'dayjs'
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isSameOrBefore)

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



const holidays = [dayjs('2022-10-05'), dayjs('2022-10-23')]

function getholidays(): array {
  return holidays
  }

function getbdarray(s: dayjs,e: dayjs): array {
 
  var i = s.clone()
  var bds = []
  const holidays = getholidays()
  // const holidays = [dayjs('2022-10-05'), dayjs('2022-10-23')]

  while (i.isSameOrBefore(e)) {

    if (i.day() == 0 || i.day() == 6 ) {
    } else if (holidays.find(element => element.isSame(i))) {
    }
    else {
      bds.push(i)
    }
    i = i.add(1, 'day')
  }
  
  return bds;
}



// routes 

app.get('/', (c) => {
  const startd = dayjs('2022-09-29')
  const endd = dayjs('2022-10-29')

  const holidays = [dayjs('2022-10-05'), dayjs('2022-10-23')]

  
  return c.json({
    start: startd.format('YYYY-MM-DD'),
    end: endd.format('YYYY-MM-DD'),
    between: endd.diff(startd, 'day'),
    holidays: holidays,
    array: getbdarray(startd, endd),
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
    
