import { isEqual, isBefore, isAfter, isWeekend, add, toDate, addBusinessDays } from 'date-fns'
import type { Interval } from 'date-fns/types'

export function eachHolidayOfInterval<DateType extends Date>(
  interval: Interval<DateType>,
  dateArray: Array<DateType | number>
): DateType[] {
  const startDate = toDate(interval.start)
  const endDate = toDate(interval.end)

  const endTime = endDate.getTime()

  // Throw an exception if start date is after end date or if any date is `Invalid Date`
  if (!(startDate.getTime() <= endTime)) {
    throw new RangeError('Invalid interval')
  }

  const dates = []

  dateArray.forEach((dirtyDate) => {
    const currentDate = toDate(dirtyDate)

    if (isEqual(currentDate, startDate) ||
        isEqual(currentDate, endDate) ||
        (isAfter(currentDate, startDate) && isBefore(currentDate, endDate))) {
      dates.push(currentDate)
      return
    }
  })

  return dates
}
export function eachWorkingDayOfInterval<DateType extends Date>(
  interval: Interval<DateType>,
  holidayArray: Array<DateType | number>,
  options?: object
): DateType[] {
  const startDate = toDate(interval.start)
  const endDate = toDate(interval.end)

  const endTime = endDate.getTime()

  // Throw an exception if start date is after end date or if any date is `Invalid Date`
  if (!(startDate.getTime() <= endTime)) {
    throw new RangeError('Invalid interval')
  }

  let dates = []

  let currentDate = startDate
  currentDate.setHours(0, 0, 0, 0)

  const step = options?.step ?? 1
  if (step < 1 || isNaN(step))
    throw new RangeError('`options.step` must be a number greater than 1')

  const holidays = holidayArray ?? []

  
  if (step < 1 || isNaN(step))
    throw new RangeError('`options.step` must be a number greater than 1')

  while (currentDate.getTime() <= endTime) {
    if (!isWeekend(currentDate)
        && (!holidays.find((holiday) => isEqual(currentDate, holiday) ))
        ) {
      dates.push(toDate(currentDate))

  }
      currentDate.setDate(currentDate.getDate() + 1)
      currentDate.setHours(0, 0, 0, 0)
      
  }

  return dates
}

export function addWorkingDays<DateType extends Date>(
  dirtyDate: DateType | number,
  amount: number,
  holidayArray: Array<DateType | number>
): DateType {
  let date = toDate(dirtyDate)
  let startInterval = date
  let resultDate = date
  let remaining = amount

  while (remaining > 0) {
    resultDate = addBusinessDays(date, remaining)
    remaining = eachHolidayOfInterval({
      start: startInterval,
      end: resultDate
    }, holidayArray).length
    date = resultDate
    startInterval = addBusinessDays(date, 1)
  }

	return resultDate
	
}

export function isWorkingDay<DateType extends Date>(
  dirtyDate: DateType | number,
  holidayArray: Array<DateType | number>
): DateType {
  const date = toDate(dirtyDate)
  if (!isWeekend(date)
      && (!holidayArray.find((holiday) => isEqual(date, holiday) ))
        ) {
    return true
  } else {
    return false
  }	
}

export function getWorkingDate<DateType extends Date>(
  dirtyDate: DateType | number,
  amount: number,
  holidayArray: Array<DateType | number>
): DateType {
  let date = toDate(dirtyDate)

  if (isWorkingDay(date, holidayArray)) {
    
    amount -= 1
  }

  return addWorkingDays(date, amount, holidayArray)
	
}