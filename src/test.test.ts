import { expect, test } from "bun:test";
import { eachWorkingDayOfInterval, addWorkingDays, isWorkingDay, getWorkingDate } from './index.ts'
import * as holidaysjson from '../holidays.json'

function getholidays(): array {
  return holidaysjson.default.map(d => new Date(d))
  }

const start = new Date('2022-09-29')
const end = new Date('2022-10-31')
const holidays = getholidays()

test("getWorkingDate", () => {
  //const fifthResult = getWorkingDate(start, 5, holidays).toString()
  //expect(fifthResult).toBe(new Date('2022-10-06').toString())
  const fifthResult = getWorkingDate(start, 5, holidays)
  expect(fifthResult).toBe(new Date('2022-10-06'))
})