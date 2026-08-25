function publicReviewProjection(review) {
  if (!review || typeof review !== 'object') return null;
  return {
    rating: review.rating,
    comment: typeof review.comment === 'string' ? review.comment : '',
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function publicOfferProjection(offer) {
  const source = offer && typeof offer.toObject === 'function' ? offer.toObject() : (offer || {});
  const projected = {
    _id: source._id,
    title: source.title,
    description: source.description,
    offeredSkill: source.offeredSkill,
    requestedSkill: source.requestedSkill,
    mode: source.mode,
    hasPrivateLocation: Boolean(source.location),
    status: source.status,
    reviews: Array.isArray(source.reviews)
      ? source.reviews.map(publicReviewProjection).filter(Boolean)
      : [],
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };

  return Object.fromEntries(
    Object.entries(projected).filter(([, value]) => value !== undefined)
  );
}

module.exports = {
  publicOfferProjection,
  publicReviewProjection,
};
