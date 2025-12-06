# Next.js 15 Upgrade - Windows Commands

## Étape 1: Créer une branche de sauvegarde
```powershell
git checkout -b upgrade/nextjs-15
```

## Étape 2: Mettre à jour les packages
```powershell
npm install next@15.5.7 react@^18.3.1 react-dom@^18.3.1 next-auth@latest
npm install -D eslint-config-next@15.5.7 @types/react@^18.3.0 @types/react-dom@^18.3.0
```

## Étape 3: Nettoyer le cache (déjà fait)
```powershell
# Si vous devez le refaire:
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
if (Test-Path node_modules\.cache) { Remove-Item -Recurse -Force node_modules\.cache }
```

## Étape 4: Rebuild
```powershell
npm run build
```

## Étape 5: Tester
```powershell
npm run dev
```

## Commandes PowerShell complètes (copier-coller)

```powershell
# 1. Créer branche
git checkout -b upgrade/nextjs-15

# 2. Installer les nouvelles versions
npm install next@15.5.7 react@^18.3.1 react-dom@^18.3.1 next-auth@latest
npm install -D eslint-config-next@15.5.7 @types/react@^18.3.0 @types/react-dom@^18.3.0

# 3. Nettoyer (déjà fait, mais au cas où)
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
if (Test-Path node_modules\.cache) { Remove-Item -Recurse -Force node_modules\.cache }

# 4. Build
npm run build

# 5. Tester
npm run dev
```

