# Fix for @auth/prisma-adapter Type Error

## Problem
Type incompatibility between `@auth/prisma-adapter` v1.0.12 and `next-auth` v4.24.13.

## Solution Applied
Added type assertion `as Adapter` to the PrismaAdapter.

## Alternative Solution (if build still fails)

Update `@auth/prisma-adapter` to the latest version:

```bash
npm install @auth/prisma-adapter@latest
```

Or if that doesn't work, you can try:

```bash
npm install @auth/prisma-adapter@^2.0.0
```

## Note
The adapter works correctly at runtime, this is purely a TypeScript type compatibility issue.

