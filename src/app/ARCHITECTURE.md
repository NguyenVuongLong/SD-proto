# Angular Architecture Boundary

This application uses a deliberate hybrid boundary while the Angular toolchain remains on Angular 16:

- `AppModule` owns the application shell and legacy module-based dependencies.
- `AppRoutingModule` remains the routing boundary and lazy-loads business pages.
- `features/business` contains standalone page components loaded with `loadComponent`.
- `core` contains application-wide services and guards shared by both sides of the boundary.
- `shared` contains reusable, presentation-independent helpers and primitives.

Do not migrate `AppModule` to standalone bootstrap, replace `RouterModule`, or introduce newer Angular APIs as incidental cleanup. Treat those changes as a separate, deliberate Angular migration with its own compatibility and rollout plan.
