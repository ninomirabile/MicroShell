const { withModuleFederationPlugin } = require("@angular-architects/module-federation/webpack");

module.exports = withModuleFederationPlugin({
  name: "dashboard",
  filename: "remoteEntry.js",
  
  exposes: {
    './Module': './apps/dashboard/src/app/remote-entry/entry.module.ts',
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