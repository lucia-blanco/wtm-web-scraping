const request = require('request-promise') //.default({ jar: true })
const cheerio = require('cheerio')

const userV = 'iwduser'
const pwdV = 'abcd1234'
const pwdI = 'dhsajkfv'

const executeScraper = async () => {
  const getProfileInformation = async () => {
    const { body, statusCode } = await request.post('https://www.minijuegos.com/ajax/user/login', {
    // IF WE DON'T ADD THE CORRECT HEADERS, WE GET AN HTTP STATUS CODE => 400 - BAD REQUEST  
    headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      form: {
        uid: userV,
        passwd: pwdV,
        remember: false,
        mp_zendesk_sso: true
      },
      // JSON TAG IS NECESSARY, SO WE DON'T HAVE TO PARSE THE RESPONSE
      json: true,
      // THE SIMPLE: FALSE TAG IS NECESSARY, SO WE CAN 'BYPASS' ERROR STATUS CODES
      // I.E. 403 - FORBIDDEN, WHEN WE INTRODUCE INVALID CREDENTIALS
      simple: false,
      // IN ORDER TO EXTRACT THE HTTP STATUS CODE, WE NEED THE FULL RESPONSE
      // FULL RESPONSE IS IN JSON FORMAT, AND WE EXTRACT BODY AND STATUS CODE.
      resolveWithFullResponse: true,
      // THE JAR TAG KEEPS TRACK OF THE COOKIES (SAVES AND LATER USES THEM)
      // IF WE WANT/NEED COOKIES IN ALL THE REQUESTS, WE CAN ADD require('request-promise').default({ jar: true })
      // IN THE DECLARATION INSTEAD OF ADDING IT IN EACH REQUEST
      jar: true
    })
    // IF THE STATUS CODE IS 403, IT MEANS CREDENTIALS ARE INVALID
    // WE COULD ALSO CHECK THE BODY IF THEY DIFFERENTIATE BETWEEN INVALID EMAIL OR PASSWORD
    if (statusCode === 403) {
      return 'Not available'
    }
    const { uid: username, progress_points: points, progress_level: level } = body.data.user
    return { username, points, level }
  }

  const getUserInformation = async () => {
    const body = await request.get('https://www.minijuegos.com/user/preferences', {
      jar: true
    })
    const $ = cheerio.load(body)
    const day = $('select#pref-birthday-day option[selected]').text().trim()
    const month = $('select#pref-birthday-month option[selected]').text().trim()
    const year = $('select#pref-birthday-year option[selected]').text().trim()
    const bithday = new Date(`${year}-${month}-${day}`).toDateString()
    return bithday
  }

  const getActivity = async () => {
    const body = await request.get('https://www.minijuegos.com/ajax-html/profile/iwduser/activity', {
      // COOKIES ARE NOT NECESSARY HERE
      qs: {
        filter: 'ALL',
        count: 1,
        startTimestamp: 0,
        limit: 60,
        lastTimePeriod: ''
      }
    })
    const $ = cheerio.load(body)
    const activityBody = $('.ai-header a', body).toArray()
    const activity = []
    activityBody.forEach(game => {
      const name = $(game).text()
      const url = $(game).attr('href')

      activity.push({ name, url })
    })
    return activity
  }
  const profileInfo = await getProfileInformation()
  // IF WE COULD NOT LOG IN, THERE IS NO USE IN TRYING TO GET USER INFORMATION 
  // IT WILL FAIL AS WE DON'T HAVE THE NECESSARY COOKIES
  const userInfo = profileInfo === 'Not available' ? 'Not available' : await getUserInformation()
  const activity = await getActivity()
  console.log({ profileInfo, userInfo, activity })
}

executeScraper()
