#!/bin/bash
# Script per rimuovere .next/ dal tracking Git

echo "🔧 Rimuovendo .next/ dal tracking Git..."

# Rimuovi .next/ dal tracking ma mantieni i file localmente
git rm -r --cached .next/

echo "✅ .next/ rimosso dal tracking Git"
echo "📝 Ora puoi committare le modifiche"