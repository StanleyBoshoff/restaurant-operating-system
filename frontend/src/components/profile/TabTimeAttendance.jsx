import React from 'react';
import TabMonthlyRegister from '../timesheets/TabMonthlyRegister';

export default function TabTimeAttendance({ employee }) {
  if (!employee) return null;

  return (
    <div className="space-y-6">
      <TabMonthlyRegister lockedEmployeeId={employee.id} />
    </div>
  );
}
