interface TimeLogAttributes {
  id: string;
  employeeId: string;
  clockIn: Date;
  clockOut?: Date;
}

/**
 * Call this when an employee clocks out.
 */
// export async function accrueLeaveOnClockOut(timeLogId: string): Promise<void> {
//   const timeLog = await TimeLog.findOne({
//     where: { id: timeLogId },
//     include: [{ model: Employee }],
//   });

//   if (!timeLog || !timeLog.clockIn || !timeLog.clockOut) {
//     throw new Error("Incomplete time log for leave accrual.");
//   }

//   const hoursWorked =
//     (new Date(timeLog.clockOut).getTime() -
//       new Date(timeLog.clockIn).getTime()) /
//     (1000 * 60 * 60);

//   if (hoursWorked <= 0) return;

//   const leaveAccrued = hoursWorked * ANNUAL_LEAVE_HOURS_PER_HOUR_WORKED;

//   const [leaveBalance, created] = await LeaveBalance.findOrCreate({
//     where: { employeeId: timeLog.employeeId },
//     defaults: { paidLeaveHours: 0, unpaidLeaveHours: 0 },
//   });

//   leaveBalance.paidLeaveHours += leaveAccrued;

//   await leaveBalance.save();
// }
