// Helper function to filter orders for the current year
module.exports.filterOrdersForYear = (orders, year) => {
  return orders.filter(order => new Date(order.deliveredOn).getFullYear() === year);
}

// Helper function to filter orders for the current month
module.exports.filterOrdersForMonth = (orders, year, month) => {
  return orders.filter(order => {
    const deliveredDate = new Date(order.deliveredOn);
    return deliveredDate.getFullYear() === year && deliveredDate.getMonth() === month;
  });
}

// Helper function to filter orders for the current week
module.exports.filterOrdersForWeek = (orders, year, month, week) => {
  return orders.filter(order => {
    const deliveredDate = new Date(order.deliveredOn);
    return (
      deliveredDate.getFullYear() === year &&
      deliveredDate.getMonth() === month &&
      Math.ceil(deliveredDate.getDate() / 7) === week
    );
  });
}

// Function to get the week number for a given date
module.exports.getWeekNumber = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNumber;
}