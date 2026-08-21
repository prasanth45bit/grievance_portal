const generateTicketNumber = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `GRV-${year}-${randomStr}`;
};

module.exports = generateTicketNumber;
