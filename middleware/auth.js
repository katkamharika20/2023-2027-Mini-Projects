// Check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) return next();
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return res.redirect('/login');
}

// Check if user is police or admin
function isPoliceOrAdmin(req, res, next) {
  if (req.session && ['police', 'admin'].includes(req.session.userRole)) return next();
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(403).json({ error: 'Access denied. Police/Admin only.' });
  }
  return res.status(403).render('error', { message: 'Access denied', user: req.session });
}

// Attach user info to all views
function attachUser(req, res, next) {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    username: req.session.username,
    role: req.session.userRole
  } : null;
  next();
}

module.exports = { isAuthenticated, isPoliceOrAdmin, attachUser };
