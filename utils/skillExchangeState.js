function actorId(user) {
  const value = user && (user.id || user._id || user.userId || user.sub);
  return value == null ? null : String(value);
}

function uniqueIds(ids) {
  return [...new Set((ids || []).map(String))];
}

function participants(exchange) {
  if (!exchange || !exchange.ownerId || !exchange.participantId) return [];
  return [String(exchange.ownerId), String(exchange.participantId)];
}

function isParticipant(exchange, id) {
  return Boolean(id && participants(exchange).includes(String(id)));
}

function addConfirmation(exchange, field, id) {
  if (!isParticipant(exchange, id)) {
    const error = new Error('Only exchange participants can confirm this transition');
    error.status = 403;
    throw error;
  }
  exchange[field] = uniqueIds([...(exchange[field] || []), String(id)]);
  return exchange[field];
}

function confirmStart(exchange, id) {
  if (exchange.status !== 'matched' && exchange.status !== 'active') {
    const error = new Error('Exchange must be matched before work can start');
    error.status = 409;
    throw error;
  }
  const confirmations = addConfirmation(exchange, 'startConfirmedBy', id);
  if (participants(exchange).every((participant) => confirmations.includes(participant))) {
    exchange.status = 'active';
  }
  return exchange.status;
}

function confirmCompletion(exchange, id) {
  if (exchange.status !== 'active' && exchange.status !== 'completed') {
    const error = new Error('Exchange must be active before it can be completed');
    error.status = 409;
    throw error;
  }
  const confirmations = addConfirmation(exchange, 'completionConfirmedBy', id);
  if (participants(exchange).every((participant) => confirmations.includes(participant))) {
    exchange.status = 'completed';
  }
  return exchange.status;
}

module.exports = {
  actorId,
  participants,
  isParticipant,
  confirmStart,
  confirmCompletion,
};
