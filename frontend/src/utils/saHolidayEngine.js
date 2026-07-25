/**
 * 🇿🇦 Automated South African Statutory Public Holiday & Roll-Over Engine
 * Computes official holidays dynamically for ANY year without external APIs.
 */

function getEasterDates(year) {
  const paschalA = year % 19;
  const paschalB = Math.floor(year / 100);
  const paschalC = year % 100;
  const paschalD = Math.floor(paschalB / 4);
  const paschalE = paschalB % 4;
  const paschalF = Math.floor((paschalB + 8) / 25);
  const paschalG = Math.floor((paschalB - paschalF + 1) / 3);
  const paschalH = (19 * paschalA + paschalB - paschalD - paschalG + 15) % 30;
  const paschalI = Math.floor(paschalC / 4);
  const paschalK = paschalC % 4;
  const paschalL = (32 + 2 * paschalE + 2 * paschalI - paschalH - paschalK) % 7;
  
  // 🎓 Fixed Initialization Order Scope:
  const paschalM = Math.floor((paschalA + 11 * paschalH + 22 * paschalL) / 451);
  const monthCalc = Math.floor((paschalH + paschalL - 7 * paschalM + 114) / 31); 
  const dayCalc = ((paschalH + paschalL - 7 * paschalM + 114) % 31) + 1;

  // Good Friday is exactly 2 days before Easter Sunday
  const easterSunday = new Date(Date.UTC(year, monthCalc - 1, dayCalc));
  const goodFriday = new Date(easterSunday);
  goodFriday.setUTCDate(goodFriday.getUTCDate() - 2);

  // Family Day (Easter Monday) is exactly 1 day after Easter Sunday
  const familyDay = new Date(easterSunday);
  familyDay.setUTCDate(familyDay.getUTCDate() + 1);

  return {
    goodFriday: goodFriday.toISOString().split('T')[0],
    familyDay: familyDay.toISOString().split('T')[0]
  };
}

export function getSaHolidaysForYear(year) {
  const { goodFriday, familyDay } = getEasterDates(year);

  const baselineHolidays = [
    { name: "New Year's Day", date: `${year}-01-01` },
    { name: "Human Rights Day", date: `${year}-03-21` },
    { name: "Good Friday", date: goodFriday },
    { name: "Family Day", date: familyDay },
    { name: "Freedom Day", date: `${year}-04-27` },
    { name: "Workers' Day", date: `${year}-05-01` },
    { name: "Youth Day", date: `${year}-06-16` },
    { name: "National Women's Day", date: `${year}-08-09` },
    { name: "Heritage Day", date: `${year}-09-24` },
    { name: "Day of Reconciliation", date: `${year}-12-16` },
    { name: "Christmas Day", date: `${year}-12-25` },
    { name: "Day of Goodwill", date: `${year}-12-26` }
  ];

  const operationalMap = [];

  baselineHolidays.forEach(holiday => {
    operationalMap.push({ ...holiday, isObservedRollOver: false });

    // Calculate day of the week to handle the Sunday Roll-Over Rule
    const dateParts = holiday.date.split('-');
    const holidayDayOfWeek = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2])).getUTCDay(); // 0 = Sunday
    
    if (holidayDayOfWeek === 0) {
      const actualDateObj = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
      actualDateObj.setUTCDate(actualDateObj.getUTCDate() + 1);
      const mondayStr = actualDateObj.toISOString().split('T')[0];

      operationalMap.push({
        name: `${holiday.name} (Observed)`,
        date: mondayStr,
        isObservedRollOver: true
      });
    }
  });

  return operationalMap;
}
