const { withModuleFederationPlugin } = require("@angular-architects/module-federation/webpack");

module.exports = withModuleFederationPlugin({
  name: "shell",
  
  remotes: {
    "dashboard": "http://localhost:4201/remoteEntry.js",
    "utenti": "http://localhost:4202/remoteEntry.js", 
    "report": "http://localhost:4203/remoteEntry.js",
  },

  shared: {
    "@angular/core": { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "@angular/common": { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "@angular/router": { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "@angular/forms": { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "@angular/material": { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "rxjs": { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "@microshell/shared": { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "@microshell/services": { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "@microshell/ui": { singleton: true, strictVersion: true, requiredVersion: "auto" },
  },
}); 