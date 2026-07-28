/**
 * Restaurant Leave Management Engine (South African BCEA Compliant)
 */

export const LEAVE_RATES = {
  RESTAURANT_ANNUAL: 1.75, // days per month
  FAMILY_RESPONSIBILITY: 3,  // days per year
};

/**
 * Calculates the number of full months between two dates.
 */
const getMonthsBetween = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  );
};

/**
 * Calculates the annual leave balance.
 */
export const calculateAnnualLeave = (employee, leaveLog = []) => {
  if (!employee?.start_date) return 0;

  const openingDate = employee.leave_opening_balance_date || employee.start_date;
  const openingBalance = parseFloat(employee.leave_opening_balance_annual || 0);

  // Calculate months passed since opening balance date
  const monthsPassed = getMonthsBetween(openingDate, new Date());

  // Total accrued = Opening + (Rate * Months)
  const totalAccrued = openingBalance + (monthsPassed * LEAVE_RATES.RESTAURANT_ANNUAL);

  // Total taken (Approved only)
  const totalTaken = leaveLog
    .filter(l => l.leave_type === 'Annual Leave' && l.status === 'Approved')
    .reduce((acc, l) => acc + parseFloat(l.total_statutory_days_deducted || 0), 0);

  return Math.max(0, totalAccrued - totalTaken);
};

/**
 * Calculates the sick leave balance based on the 6-month cliff and 3-year cycle.
 */
export const calculateSickLeave = (employee, leaveLog = []) => {
  if (!employee?.start_date) return 0;

  const startDate = new Date(employee.start_date);
  const now = new Date();
  const monthsEmployed = getMonthsBetween(startDate, now);

  // First 6 months: 1 day for every 26 days worked (simplified to 1 day per month)
  if (monthsEmployed < 6) {
    const totalEarned = monthsEmployed; // simplified
    const taken = leaveLog
      .filter(l => l.leave_type === 'Sick Leave' && l.status === 'Approved')
      .reduce((acc, l) => acc + parseFloat(l.total_statutory_days_deducted || 0), 0);
    return Math.max(0, totalEarned - taken);
  }

  // After 6 months: Full cycle (30 or 36 days)
  const cycleDays = employee.work_week_days === 6 ? 36 : 30;

  // Find current 3-year cycle start
  const sixMonthMark = new Date(startDate);
  sixMonthMark.setMonth(sixMonthMark.getMonth() + 6);

  const yearsSinceMark = now.getFullYear() - sixMonthMark.getFullYear();
  const cycleNumber = Math.floor(yearsSinceMark / 3);
  const currentCycleStart = new Date(sixMonthMark);
  currentCycleStart.setFullYear(currentCycleStart.getFullYear() + (cycleNumber * 3));

  const takenInCycle = leaveLog
    .filter(l =>
      l.leave_type === 'Sick Leave' &&
      l.status === 'Approved' &&
      new Date(l.start_date) >= currentCycleStart
    )
    .reduce((acc, l) => acc + parseFloat(l.total_statutory_days_deducted || 0), 0);

  return Math.max(0, cycleDays - takenInCycle);
};

/**
 * Calculates family responsibility leave (3 days per year).
 */
export const calculateFamilyLeave = (employee, leaveLog = []) => {
  if (!employee?.start_date) return 0;

  const now = new Date();
  const currentYearStart = new Date(now.getFullYear(), 0, 1);

  const takenThisYear = leaveLog
    .filter(l =>
      l.leave_type === 'Family Responsibility' &&
      l.status === 'Approved' &&
      new Date(l.start_date) >= currentYearStart
    )
    .reduce((acc, l) => acc + parseFloat(l.total_statutory_days_deducted || 0), 0);

  return Math.max(0, LEAVE_RATES.FAMILY_RESPONSIBILITY - takenThisYear);
};

/**
 * Projects a balance for a future date.
 */
export const projectAnnualBalance = (employee, leaveLog, targetDate) => {
  const currentBalance = calculateAnnualLeave(employee, leaveLog);
  const monthsUntilTarget = getMonthsBetween(new Date(), targetDate);

  if (monthsUntilTarget <= 0) return currentBalance;

  return currentBalance + (monthsUntilTarget * LEAVE_RATES.RESTAURANT_ANNUAL);
};
