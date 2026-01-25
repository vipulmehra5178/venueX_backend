const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("NO_EMAIL_FROM_GOOGLE"), null);
        }

        const intent = req.query.state; 

        let user = await User.findOne({ email });

        if (intent === "login") {
          if (!user) {
            return done(new Error("ACCOUNT_NOT_FOUND"), null);
          }
        }

        if (intent === "register") {
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email,
              authProvider: "google",
              googleId: profile.id,
              roles: ["attendee"],
              isEmailVerified: true,
            });
          }
        }

        const token = jwt.sign(
          {
            userId: user._id,
            roles: user.roles,
            name: user.name,
            email: user.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return done(null, { token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
