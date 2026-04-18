# Git Flow Workflow

## Ramas

- `main` → Producción (solo merges desde release/hotfix)
- `develop` → Integración de features (base para features)
- `feature/` → Features nuevos
- `release/` → Preparación de release
- `hotfix/` → Fixes urgentes en producción

## Workflow

### Empezar un feature:
```bash
git flow feature start nombre-del-feature
```

### Terminar un feature:
```bash
git flow feature finish nombre-del-feature
```

### Hacer un fix urgente:
```bash
git flow hotfix start nombre-del-hotfix
git flow hotfix finish nombre-del-hotfix
```

### Sincronizar develop con main:
```bash
git flow release start v1.0.0
git flow release finish v1.0.0
```

## Reglas

1. **NUNCA** hacer commit directo a `main` o `develop`
2. **SIEMPRE** trabajar en `feature/` branches
3. Antes de merge, hacer `git pull origin develop` para evitar conflictos
4. Mensajes de commit descriptivos

## Quick Reference

```bash
# Nuevo feature
git flow feature start mi-feature
# ...trabajar...
git flow feature finish mi-feature

# Ver estado
git flow feature list
git flow release list
git flow hotfix list

# Publicar branch
git flow feature publish mi-feature
git flow feature pull origin mi-feature
```
