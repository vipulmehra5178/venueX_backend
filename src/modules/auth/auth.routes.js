const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const controller = require("./auth.controller");

router.post("/register", controller.register);
router.post("/login", controller.login);

const passport = require("passport");


router.get(
  "/google/login",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: "login",
  })
);


router.get(
  "/google/register",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: "register",
  })
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    (err, user) => {
      if (err && err.message === "ACCOUNT_NOT_FOUND") {
        return res.redirect(
          `${process.env.FRONTEND_URL}/register?error=google_account_not_found`
        );
      }

      if (err || !user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
        );
      }

      const { token } = user;
      return res.redirect(
        `${process.env.FRONTEND_URL}/oauth-success?token=${token}`
      );
    }
  )(req, res, next);
});


router.post(
  "/request-organizer",
  authMiddleware,
  controller.requestOrganizer
);

router.post(
  "/approve-organizer",
  authMiddleware,
  rbac(["admin"]),
  controller.approveOrganizer
);

router.post(
  "/grant-admin",
  authMiddleware,
  rbac(["admin"]),
  controller.grantAdmin
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const { token } = req.user;

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${token}`
    );
  }
);

router.get(
  "/me",
  authMiddleware,
  (req, res) => {
    res.json({
      success: true,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        roles: req.user.roles,
      },
    });
  }
);

module.exports = router;
