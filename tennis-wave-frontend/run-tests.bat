@echo off
echo Running component unit tests...
npx vitest run --config vitest.config.components.ts
pause 