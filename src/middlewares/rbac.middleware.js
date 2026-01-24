module.exports = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const userRoles = req.user.roles;

    const hasAccess = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};
