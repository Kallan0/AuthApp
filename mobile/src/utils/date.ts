export const formatDate = (value: string) => new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
export const isOverdue = (deadline: string, status: string, now = Date.now()) => status === 'pending' && Date.parse(deadline) < now;
