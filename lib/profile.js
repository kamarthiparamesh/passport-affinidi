exports.profileParser = function (user) {
  const custom = user["custom"];

  const email = custom?.find((i) => typeof i.email === "string")?.email;
  const givenName = custom?.find((i) => typeof i.givenName === "string")?.givenName || '';
  const familyName = custom?.find((i) => typeof i.familyName === "string")?.familyName || '';
  const picture = custom?.find((i) => typeof i.picture === "string")?.picture;

  const profile = {
    id: user.sub,
    userId: user.sub,
    name: `${givenName} ${familyName}`.trim(),
    email,
    image: picture,
  };

  return profile;
};
