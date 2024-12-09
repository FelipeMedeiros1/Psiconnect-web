const PROXY_CONFIG = [
  {
    context: ["/pacientes", "/auth", "/oauth2", "/login", "/logout"],
    target: "http://localhost:8080",
    secure: false,
    logLevel: "debug",
  },
];

module.exports = PROXY_CONFIG;
