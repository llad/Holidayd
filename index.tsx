import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { Database } from "bun:sqlite";
import { isEqual, isBefore, isWeekend, add } from 'date-fns'
import * as dayjs from 'dayjs'
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import * as holidaysjson from './holidays.json'
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


function getholidays(): array {
  return holidaysjson.default.map(d => new Date(d))
  }

function getbdarray(start: Date, end: Date, holidays: array): array {
 
  let i = new Date(start.valueOf()) 
  let bdays = []

  while (isBefore(i,end) || isEqual(i,end)) {

    if (isWeekend(i)) {
    } else if (holidays.find(holiday => isEqual(holiday,i))) {
    }
    else {
      bdays.push(i)
    }
    i = add(i, {days: 1})
  }
  
  return bdays;
}

function dateonbd({n, s, e, h}) {
	const bdarray = getbdarray(s, e, h);
	return bdarray[n-1];
	
}

function bdondate(date, start, end, holidays) {
	const bdarray = getbdarray(start, end, holidays);
	return bdarray.findIndex(bd => isEqual(bd, date))+1;
}

function monthbd(start,n) {
	let end = start.startOf('month').endOf('month');
	console.log('range:', start, end)
	return dateonbd({n:n, s:start, e:end})
	
}


// routes 

app.get('/', (c) => {
  const start = new Date('2022-09-29')
  const end = new Date('2022-10-29')
  const holidays = getholidays()
  
  return c.json({
    holidays: getholidays(),
    getbdarray: getbdarray(start, end, holidays),
    bdondate: bdondate(new Date('2022-10-18'), start, end, holidays)
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
    
