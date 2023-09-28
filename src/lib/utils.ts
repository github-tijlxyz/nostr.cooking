export function formatDate(unixtimestamp: number) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  const date = new Date(unixtimestamp * 1000);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  const formattedDate = `${day} ${month} ${year}`;
  return formattedDate;
}

export function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    const formattedAmount = amount / 1000000;
    return formattedAmount % 1 === 0 ? `${formattedAmount}M` : `${formattedAmount.toFixed(1)}M`;
  } else if (amount >= 1000) {
    const formattedAmount = amount / 1000;
    return formattedAmount % 1 === 0 ? `${formattedAmount}K` : `${formattedAmount.toFixed(1)}K`;
  } else {
    return amount.toString();
  }
}
