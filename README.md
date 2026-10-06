# SDProto

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Authentication configuration

The Angular login page calls `{INET_URI}/damtc/auth/authenticate` with AES-encrypted `Username`, `Password`, and `AppCode` query parameters. The app code is `E-INTRANET`; the external authentication service validates credentials and returns `Code: "Success"` on success. Hosts are `http://localhost:6600` for development, `http://10.11.51.41:6600` for UAT, and `https://intranetservice.dongamoneytransfer.com.vn` for production. Encryption uses the fixed compatibility key and IV in `src/app/core/auth/encrypt.helper.ts`, parsed as UTF-8 bytes; they are client-visible protocol values, not secrets.

These values are compiled into browser code. AES-CBC here only reproduces the external service's request contract; the key and IV are visible to users, Base64 storage is reversible, and localStorage plus the Angular route guard do not authorize API requests. For real authorization, the backend must issue and validate a signed session or token on every protected API request.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
