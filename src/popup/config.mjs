export const statusMap = new Map();
statusMap.set(['Open', 'Action Needed'], { type: 'open' });
statusMap.set(['To Do'], { type: 'todo' });
statusMap.set(['In Progress'], { type: 'wip' });
statusMap.set(['Resolved', 'Scheduled', 'In Review'], { type: 'resolved' });
statusMap.set(['Closed', 'Done'], { type: 'closed' });
